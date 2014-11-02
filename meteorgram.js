Photos = new Mongo.Collection('photos');
Comments = new Mongo.Collection('comments');

Meteor.methods({
  addPhoto: function (imageData) {
    if (! Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }

    Photos.insert({source: imageData, userId: Meteor.userId(), createdAt: new Date()});
  },

  likePhoto: function (photo) {
    if (! Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }

    Photos.update({_id: photo._id}, {$inc: {'numberOfLikes': 1}, $addToSet: {'likedUserIds': Meteor.userId()}});
  },

  addComment: function (photo, comment) {
    if (! Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }

    var commentId = Comments.insert({body: comment, userId: Meteor.userId(), createdAt: new Date()});
    Photos.update({_id: photo._id}, {$push: {commentIds: commentId}});
  }
});

if (Meteor.isClient) {
  // Configure accounts-ui to use username field
  Meteor.startup(function () {
    Accounts.ui.config({
      passwordSignupFields: 'USERNAME_ONLY'
    });
  });

  // Subscribe to data from the server
  Meteor.startup(function () {
    Meteor.subscribe('photos');
    Meteor.subscribe('users');
    Meteor.subscribe('comments');
  });

  // Photos listing template
  Template.photos.helpers({
    photos: function () {
      return Photos.find({}, {sort: {'createdAt': -1}});
    }
  });

  Template.photos.events({
    'click button.take-photo': function () {
      MeteorCamera.getPicture({width: 400, height: 400}, function (error, imageData) {
        if (error) {
          alert(error);
          return;
        }
        Meteor.call('addPhoto', imageData, function(error, result) {
          if (error) {
            alert(error);
          }
        });
      });
    }
  });

  // Individual Photo template
  Template.photo.helpers({
    hasLiked: function () {
      if (!Meteor.user()) {
        return false;
      } else {
        return _(this.likedUserIds).contains(Meteor.userId());
      }
    },

    user: function () {
      return Meteor.users.findOne({_id: this.userId});
    },

    comments: function () {
      var commentIds = this.commentIds || [];
      return Comments.find({_id: {$in: commentIds}}, {sort: {'createdAt': 1}});
    },
  });

  Template.photo.events({
    'click button.like-photo': function () {
      Meteor.call('likePhoto', this, function(error, result) {
        if (error) {
          alert(error);
        }
      });
    },

    'submit': function (event, template) {
      event.preventDefault();

      var body = template.find('[name=comment]').value;

      if (body.length < 1) {
        alert('Please enter a comment!');
        return false;
      }

      if (body.length > 140) {
        alert('That comment is too long!');
        return false;
      }

      Meteor.call('addComment', this, body, function (error, result) {
        if (!error) {
          $('[name=comment]').val('');
        }
      });
    }
  });

  // Individual Comment template
  Template.comment.helpers({
    user: function () {
      return Meteor.users.findOne({_id: this.userId});
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    Meteor.publish('photos', function () {
      return Photos.find({});
    });

    Meteor.publish('users', function () {
      return Meteor.users.find();
    });

    Meteor.publish('comments', function () {
      return Comments.find({});
    });
  });
}
