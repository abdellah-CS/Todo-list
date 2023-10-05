//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://admin-abdellah:yCq1qZs2ZwKLOLHp@cluster0.pwoh3ym.mongodb.net/todolistDB', { useNewUrlParser: true, useUnifiedTopology: true });

const itemsSchema = new mongoose.Schema ({
    name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name:  "Welcome to your todolist!"
});

const item2 = new Item({
  name:  "Hit the + button to add a new item."
});

const item3 = new Item({
  name:  "<-- it this to delete and item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {
 
  Item.find({})
  .then((foundItems) => {
    if (foundItems.length === 0) {
      // If no items found, insert default items using a Promise
      return Item.insertMany(defaultItems)
        .then(() => {
          console.log('Item inserted successfully!');
        })
        .catch((error) => {
          console.error('Error inserting:', error);
        })
        .then(() => {
          // After inserting items, redirect
          res.redirect("/");
        });
    } else {
      // If items are found, render the list
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  })
  .catch((err) => {
    console.error(err);
  });
});


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item ({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName})
    .then((foundList) => {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
    .catch((error) => {
      console.error('Error finding:', error);
    })
  }
});


app.post("/delete", function (req, res) {

  const listName = req.body.listName;
  const itemId = req.body.checkbox;

  if (listName === "Today") {
    Item.findByIdAndRemove(itemId)
      .then(() => {
        console.log("removed successfully1");
        res.redirect("/");
      })
      .catch((error) => {
        console.error('Error removing1:', error);
      }) 
  } else {      
    List.findOneAndUpdate(
      { name: listName },
      { $pull: {items: { _id: itemId } } })
        .then(() => {
          console.log("removed successfully2");
          res.redirect("/" + listName);
        })
        .catch((error) => {
          console.error('Error removing2:', error);
        })
  }
});


app.get("/:paramName", function(req,res){
  const paramName = _.capitalize(req.params.paramName);

  List.findOne({name: paramName})
  .then((foundList) => {
    if (!foundList){
      const list = new List ({
        name: paramName,
        items: defaultItems
      });
      list.save();
      res.redirect("/" + paramName);
    }
    else {
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }
  })
  .catch((error) => {
    console.error('Error finding:', error);
  })
});


app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port || 3000, function() {
  console.log("Server is running on port" + port);
});