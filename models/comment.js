/**
 * Created by Administrator on 2016/1/14.
 */
var mongodb=require('./db');
function Comment(type,day,title,comment){
    this.type=type;
    this.day=day;
    this.title=title;
    this.comment=comment;
}
module.exports=Comment;
Comment.prototype.save= function (callback) {
    var type=this.type,
        day=this.day,
        title=this.title,
        comment=this.comment;
    mongodb.open(function (err,db) {
        if(err){
            mongodb.close;
            return callback(err);
        }
        db.collection('posts', function (err,collection) {
            if(err){
                mongodb.close();
                callback(err);
            }
            collection.update({
                "type":type,
                "time.day":day,
                "title":title
            },
                {$push:{
                    "comments":comment
            }}, function (err) {
                    mongodb.close();
                    if(err){
                        return callback(err)
                    }
                    return callback(null);
                })
        })
    })
}
