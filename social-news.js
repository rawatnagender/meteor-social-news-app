News = new Mongo.Collection("news");

var Images = new FS.Collection("images", {
  stores: [new FS.Store.GridFS("images")]
});

Meteor.methods({
    addNews: function (title,url) {
        News.insert({
            title: title,
            url:url,
            urlTitle:title.replace(/\s/g,'-'),
            dateAdded:new Date()
        });
    }
});


if (Meteor.isClient) {

    Template.allNewsView.helpers({
        news: function () {
            return News.find({},{sort: {dateAdded: -1}});
        }
    });

    Template.imageView.helpers({
      images: function () {
        return Images.find(); // Where Images is an FS.Collection instance
      }
    });

    Template.addNews.events({
       'submit .addNewsForm':function(e){

           var title= e.target.title.value;

           var url= e.target.url.value;

           var files = event.target.files;


           if(!title || !url){
               return false;
           }

            for (var i = 0, ln = files.length; i < ln; i++) {
            Images.insert(files[i], function (err, fileObj) {
              // Inserted new doc with ID fileObj._id, and kicked off the data upload using HTTP
            });
            }
           Meteor.call('addNews',title,url);

           Router.go('news.all');

           return false;
       },

       'change .myFileInput': function(event, template) {


        }
    });
}

Router.route('/', function () {
    this.render('allNewsView');
},{
    name:'news.all'
});

Router.route('/news/add', function () {
    this.render('addNews');
},{
    name: 'news.add'
});

Router.route('/news/:title', function () {
    this.render('newsView', {
        data: function () {
            return News.findOne({urlTitle: this.params.title});
        }
    });
},{
    name: 'news.single'
});
