News = new Mongo.Collection("news");

Meteor.startup(function () {

  smtp = {
      username: 'nagi.rawat4',   // eg: server@gentlenode.com
      password: 'nrnrnene',   // eg: 3eeP1gtizk5eziohfervU
      server:   'smtp.gmail.com',  // eg: mail.gandi.net
      port: 25
    }
    process.env.MAIL_URL = 'smtp://' + encodeURIComponent(smtp.username) + ':' + encodeURIComponent(smtp.password) + '@' + encodeURIComponent(smtp.server) + ':' + smtp.port;


  });





// // Images = new FS.Collection("Images", {
// //   stores: [new FS.Store.FileSystem("Images", {path: "~/uploads"})]
// // });

Images = new FS.Collection("Images", {
    stores: [
      new FS.Store.FileSystem("Images", {path: "~/uploads"}),
      new FS.Store.FileSystem("thumbs", {path: "~/uploads",
        transformWrite: function(fileObj, readStream, writeStream) {
          // Transform the image into a 10x10px thumbnail
          gm(readStream, fileObj.name()).resize('100', '100').stream().pipe(writeStream);
        }
      })
    ]
    // ,
    // filter: {
    //   allow: {
    //     contentTypes: ['image/*'] //allow only images in this FS.Collection
    //   }
    // }
});
if (Meteor.isServer) {
  Meteor.methods({
    'sendEmail': function(){
        Email.send({
          from: "nagi.rawat4@gmail.com",
          to: "nagi.rawat3@gmail.com",
          subject: "News add mail",
          text: "One news added to your app right now...please autheticate it... :)"
        });
    }
  });

}


if (Meteor.isClient) {

    Template.allNewsView.helpers({
        news: function () {
            return News.find({},{sort: {dateAdded: -1}});
        }
    });

    Template.imageView.helpers({
      images: function () {
        var current_news = this._id;
        imageUrl = Images.findOne({owner:current_news}, {}).url("thumbs");
        var returnedImage = {url : imageUrl}; // Where Images is an FS.Collection instance
        return returnedImage;
      }
    });

    Template.addNews.events({
       'submit .addNewsForm':function(e, template){
           e.preventDefault();
           var title= e.target.title.value;

           var url= e.target.url.value;

           var fileObj = template.find('input:file');

           var news_lat = News.insert({
            title: title,
            url:url,
            urlTitle:title.replace(/\s/g,'-'),
            dateAdded:new Date()
           }, function(err, result){

            if(result){
              // alert(result);
              // alert("news successfully added");
              // var fileObj = template.find('input:file');
              // alert("file object")
              // alert(fileObj);
              var imageObj = Images.insert(fileObj.files[0], function (err, fileObj) {
              });
              var imageUpdated = Images.update(
              {_id:imageObj._id},
              {
                $set: {owner:result, owner_type:'news'},
              }
              );
              console.log(imageUpdated);
              // alert("image inserted successfully");
           }
         });

        Meteor.call('sendEmail');

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
