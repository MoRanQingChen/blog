/**
 * Created by Administrator on 2016/1/11.
 */
var mongodb = require('./db');
markdown = require('markdown').markdown;

function Post(type, title, post) {
    this.type = type;
    this.title = title;
    this.post = post;
}

module.exports = Post;

//�洢һƪ���¼��������Ϣ
Post.prototype.save = function(callback) {
    var date = new Date();
    //�洢����ʱ���ʽ�������Ժ���չ
    var time = {
        date: date,
        year : date.getFullYear(),
        month : date.getFullYear() + "-" + (date.getMonth() + 1),
        day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
        minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
        date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()),
    }
    //Ҫ�������ݿ���ĵ�
    var post = {
        type: this.type,
        time: time,
        title:this.title,
        post: this.post,
        comments: []
    };
    //�����ݿ�
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //��ȡ posts ����
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //���ĵ����� posts ����
            collection.insert(post, {
                safe: true
            }, function (err) {
                mongodb.close();
                if (err) {
                    return callback(err);//ʧ�ܣ����� err
                }
                callback(null);//���� err Ϊ null
            });
        });
    });
};

//��ȡ���¼��������Ϣ
Post.getAll = function(type, callback) {
    //�����ݿ�
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //��ȡ posts ����
        db.collection('posts', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            var query = {};
            if (type) {
                query.type = type;
            }
            //���� query �����ѯ����
            collection.find(query).sort({
                time: -1
            }).toArray(function (err, docs) {
                mongodb.close();
                if (err) {
                    return callback(err);//ʧ�ܣ����� err
                };
                callback(null, docs);//�ɹ�����������ʽ���ز�ѯ�Ľ��
            });
        });
    });
};
Post.getOne = function(type, day, title, callback) {
    //�����ݿ�
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //��ȡ posts ����
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //�����û������������ڼ����������в�ѯ
            collection.findOne({
                "type": type,
                "time.day": day,
                "title": title
            }, function (err, doc) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                //���� markdown Ϊ html
                callback(null, doc);//���ز�ѯ��һƪ����
            });
        });
    });
};
Post.edit= function (type,day,title,callback) {
    mongodb.open(function (err,db) {
        if(err){return callback(err)};
        db.collection('posts', function (err,collect) {
            if(err){
                mongodb.close();
                return callback(err);
            }
            collect.findOne({
                "type":type,
                "time.day":day,
                "title":title
            }, function (err,doc) {
                if(err){
                    mongodb.close();
                    return callback(err);
                }
                mongodb.close();
                return callback(null,doc);
            })
        })
    })
}
Post.update = function(type, day, title, post, callback) {
    //�����ݿ�
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //��ȡ posts ����
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //������������
            collection.update({
                "type": type,
                "time.day": day,
                "title": title
            }, {
                $set: {post: post}
            }, function (err) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        });
    });
};
Post.remove = function(type, day, title, post, callback) {
    //�����ݿ�
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //��ȡ posts ����
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //������������
            collection.remove({
                "type": type,
                "time.day": day,
                "title": title
            }, {
                w: 1  /*Ϊʲô����*/
            }, function (err) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        });
    });
};

