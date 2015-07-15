News = new Mongo.Collection("news");

var

Images = new FS.Collection("Images", {
  stores: [new FS.Store.FileSystem("Images", {path: "~/uploads"})]
});

Meteor.methods({
    addNews: function (title,url) {
      alert("inside add_news");
        // News.insert({
        //     title: title,
        //     url:url,
        //     urlTitle:title.replace(/\s/g,'-'),
        //     dateAdded:new Date()
        // });
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
       'submit .addNewsForm':function(e, template){
           var title= e.target.title.value;

           var url= e.target.url.value;
           alert("hello1")

           var news_lat = News.insert({
            title: title,
            url:url,
            urlTitle:title.replace(/\s/g,'-'),
            dateAdded:new Date()
           }, function(err, result){

            if(result){
              alert(result);
              alert("news successfully added");

           }
         });
           alert("hello2")

            var files = template.find('input:file');
            alert(files);
            for (var i = 0, ln = files.length; i < ln; i++) {
            alert("inside for loop");
            Images.insert(files[i], function (err, fileObj) {
              alert("image inserted successfully")
              alert(fileObj);
              // Inserted new doc with ID fileObj._id, and kicked off the data upload using HTTP
            });
          }
          alert("after for loop");

          // FS.Utility.eachFile(event, function(file) {
          //     alert("in utility");
          //     alert(file);
          //     Images.insert(file, function (err, fileObj) {
          //       if (err){
          //         // handle error
          //       } else {
          //           // handle success depending what you need to do
          //         var userId = Meteor.userId();
          //         var imagesURL = {
          //           "profile.image": "/cfs/files/images/" + fileObj._id
          //         };
          //         News.update({_id:news_lat}, {$set: imagesURL});
          //       }
          //     });
          //   });
          alert("after utility");
           // Meteor.call('addNews',title,url);

           Router.go('news.all');

           return false;
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
