/**
 * Created by Administrator on 2016/1/17.
 */
var mongodb = require('./db');
markdown = require('markdown').markdown;

function Liuyan(name, post) {
    this.name = name;
    this.post = post;
}

module.exports = Liuyan;

//�洢һƪ���¼��������Ϣ
Liuyan.prototype.save = function(callback) {
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
    var liuyan = {
        name: this.name,
        time: time,
        post: this.post,
    };
    //�����ݿ�
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //��ȡ posts ����
        db.collection('liuyan', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //���ĵ����� posts ����
            collection.insert(liuyan, {
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
Liuyan.getAll = function(name, callback) {
    //�����ݿ�
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //��ȡ posts ����
        db.collection('liuyan', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            var query = {};
            if (name) {
                query.name = name;
            }
            //���� query �����ѯ����
            collection.find(query).sort({
                time: -1
            }).toArray(function (err, docs) {
                mongodb.close();
                if (err) {
                    return callback(err);//ʧ�ܣ����� err
                }
                docs.forEach(function (doc) {
                    doc.post = markdown.toHTML(doc.post);
                });
                callback(null, docs);//�ɹ�����������ʽ���ز�ѯ�Ľ��
            });
        });
    });
};