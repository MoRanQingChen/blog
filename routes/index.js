/*comments新建集合*/
var crypto = require('crypto'),
    User = require('../models/user.js'),
    Post = require('../models/post.js'),
    Comment=require('../models/comment.js'),
    Liuyan=require('../models/liuyan.js')

module.exports = function(app) {
  app.get('/', function (req, res) {
      res.render('index', {
        title: '墨染轻尘个人博客',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
    });
  });
  app.get('/jianli', function (req,res) {
    res.render('jianli',{
      title: '墨染轻尘个人博客',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    })
  })
  app.get('/bowen', function (req, res) {
    Post.getAll(null, function (err, posts) {
      if (err) {
        posts = [];
      }
      res.render('bowen', {
        title: '博文',
        user: req.session.user,
        posts: posts,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });
  app.get('/reg', checkNotLogin);
  app.get('/reg', function (req, res) {
    res.render('reg', {
      waring:' ',
      title: '注册',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
  app.post('/reg', checkNotLogin);
  app.post('/reg', function (req, res) {
    var name = req.body.name,
        password = req.body.password,
        password_re = req.body['password-repeat'];

    var reg=/^[a-zA-Z]\w{5,17}$/;
    if(reg.test(name)==false){
      res.render('reg', {
        flag:true,
        waring:'账号必须字母开头、长度不低于6位',
        title: '注册',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      })
      return
    }
    if(password.length<6){
      res.render('reg', {
        flag:true,
        waring:'密码长度不能低于6位 ',
        title: '注册',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      })
      return
    }
    if (password_re != password) {
      res.render('reg', {
        flag:true,
        waring:'两次密码必须一致 ',
        title: '注册',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      })
      return
    }
    var md5 = crypto.createHash('md5'),
        password = md5.update(req.body.password).digest('hex');
    var newUser = new User({
      name: name,
      password: password,
      email: req.body.email
    });
    User.get(newUser.name, function (err, user) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      if (user) {
        req.flash('error', '用户已存在!');
        return res.redirect('/reg');
      }
      newUser.save(function (err, user) {
        if (err) {
          req.flash('error', err);
          return res.redirect('/reg');
        }
        req.session.user = user;
        req.flash('success', '注册成功!');
        res.redirect('/');
      });
    });
  });
  app.get('/login', checkNotLogin);
  app.get('/login', function (req, res) {
    res.render('login', {
      waring:' ',
      title: '登录',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
  app.post('/login', checkNotLogin);
  app.post('/login', function (req, res) {



    var md5 = crypto.createHash('md5'),
        password = md5.update(req.body.password).digest('hex');
    User.get(req.body.name, function (err, user) {
      if (!user||req.body.name.length<2) {
        res.render('login', {
          flag:true,
          waring:'用户名不存在！ ',
          title: '注册',
          user: req.session.user,
          success: req.flash('success').toString(),
          error: req.flash('error').toString()
        })
        return
      }
      if (user.password != password) {
        res.render('login', {
          flag:true,
          waring:'密码不正确 ',
          title: '注册',
          user: req.session.user,
          success: req.flash('success').toString(),
          error: req.flash('error').toString()
        })
        return
      }
      req.session.user = user;
      req.flash('success', '登陆成功!');
      res.redirect('/');
    });
  });
  app.get('/post', checkLogin);
  app.get('/post', function (req, res) {
    res.render('post', {
      title: '发表',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
  app.post('/post', checkLogin);
  app.post('/post', function (req, res) {
    var currentUser = req.session.user,
        post = new Post(req.body.type, req.body.title, req.body.post);
    post.save(function (err) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      req.flash('success', '发布成功!');
      res.redirect('/bowen');//发表成功跳转到主页
    });
  });
  app.get('/logout', checkLogin);
  app.get('/logout', function (req, res) {
    req.session.user = null;
    req.flash('success', '登出成功!');
    res.redirect('/');
  });
  app.get('/upload',checkLogin);
  app.get('/upload', function (req,res) {
    res.render('upload',{
      title:'文件上传',
      user:req.session.user,
      success:req.flash('success').toString(),
      error:req.flash('error').toString()
    });
  });
  app.post('/upload',checkLogin);
  app.post('/upload', function (req,res) {
    req.flash('success','文件上传成功');
    res.redirect('/upload');
  });
  app.get('/u/:type/:day/:title', function (req, res) {
    Post.getOne(req.params.type, req.params.day, req.params.title, function (err, post) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      res.render('article', {
        title: '博文',
        post: post,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });
  app.get('/u/:type', function (req, res) {
    //检查用户是否存在
    Post.getAll(req.params.type, function (err, posts) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      res.render('user', {
        title: req.params.type+'类文章列表',
        posts: posts,
        user : req.session.user,
        success : req.flash('success').toString(),
        error : req.flash('error').toString()
      });
    });
/*    User.get(req.params.name, function (err, user) {
      if (!user) {
        req.flash('error', '用户不存在!');
        return res.redirect('/');//用户不存在则跳转到主页
      }
      //查询并返回该用户的所有文章
      Post.getAll(user.name, function (err, posts) {
        if (err) {
          req.flash('error', err);
          return res.redirect('/');
        }
        res.render('user', {
          title: '类文章列表',
          posts: posts,
          user : req.session.user,
          success : req.flash('success').toString(),
          error : req.flash('error').toString()
        });
      });
    });*/
  });

  app.post('/u/:type/:day/:title', function (req,res) {
    var date=new Date(),
        time=date.getFullYear()+'-'+date.getMonth()+'-'+date.getDate()+','+date.getHours()+':'+(date.getMinutes()>10?date.getMinutes():'0'+date.getMinutes)
    var comment={
      name:req.body.name,
      email:req.body.email,
      website:req.body.website,
      time:time,
      content:req.body.content
    };
    var newComment=new Comment(req.params.type,req.params.day,req.params.title,comment);
    newComment.save(function (err) {
      if(err){
        req.flash('error',err);
        return res.redirect('back');
      }
      req.flash('success','留言成功')
      res.redirect('back');
    })
  });
  app.get('/edit/:type/:day/:title', checkLogin);
  app.get('/edit/:type/:day/:title', function (req, res) {
    var currentUser = req.session.user;
    Post.edit(req.params.type, req.params.day, req.params.title, function (err, post) {
      if (err) {
        req.flash('error', err);
        return res.redirect('back');
      }
      res.render('edit', {
        title: '编辑',
        post: post,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });
  app.post('/edit/:type/:day/:title', checkLogin);
  app.post('/edit/:type/:day/:title', function (req, res) {
    var currentUser = req.session.user;
    Post.update(req.params.type, req.params.day, req.params.title, req.body.post, function (err) {
      var url = encodeURI('/u/' + req.params.type + '/' + req.params.day + '/' + req.params.title);
      if (err) {
        req.flash('error', err);
        return res.redirect(url);//出错！返回文章页
      }
      req.flash('success', '修改成功!');
      res.redirect(url);//成功！返回文章页
    });
  });
  app.get('/delete/:type/:day/:title', checkLogin);
  app.get('/delete/:type/:day/:title', function (req, res) {
    var currentUser = req.session.user;
    Post.remove(req.params.type, req.params.day, req.params.title, req.body.post, function (err) {
      var url = encodeURI('/u/' + req.params.type + '/' + req.params.day + '/' + req.params.title);
      if (err) {
        req.flash('error', err);
        return res.redirect(url);//出错！返回文章页
      }
      req.flash('success', '修改成功!');
      res.redirect('/');//成功！返回文章页
    });
  });
  app.get('/liuyan', function (req,res) {
    Liuyan.getAll(null,function(err,liuyan){
      res.render('liuyan', {
        title: '留言板',
        user: req.session.user,
        liuyan: liuyan,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    })
  })
  app.post('/liuyan',checkLogin);
  app.post('/liuyan', function (req,res) {
    var currentUser = req.session.user,
        liuyan = new Liuyan(currentUser.name, req.body.post);
    liuyan.save(function (err) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      req.flash('success', '留言成功!');
      res.redirect('/liuyan');//发表成功跳转到主页
    });
  })
  function checkLogin(req, res, next) {
    if (!req.session.user) {
      req.flash('error', '未登录!');
      res.redirect('/login');
    }
    next();
  }
  function checkNotLogin(req, res, next) {
    if (req.session.user) {
      req.flash('error', '已登录!');
      res.redirect('back');
    }
    next();
  }
};



function startMove(obj, attr, iTarget)
{
  clearInterval(obj.timer);
  obj.timer=setInterval(function (){
    var iCur=parseInt(getStyle(obj, attr));
    var iSpeed=(iTarget-iCur)/8;
    iSpeed=iSpeed>0?Math.ceil(iSpeed):Math.floor(iSpeed);

    if(iCur==iTarget)
    {
      clearInterval(obj.timer);
    }
    else
    {
      obj.style[attr]=iCur+iSpeed+'px';
    }
  }, 30)
}
function starMove(obj, attr, iTarget){
  clearInterval(obj.timer);
  obj.timer=setInterval(function (){
    var iCur=parseInt(getStyle(obj, attr));
    var sheep=(iTarget-iCur)/8;
    if(sheep>0){
      sheep=Math.ceil(sheep);
    }
    else{
      sheep=Math.floor(sheep);
    }
    if(iCur==iTarget){
      clearInterval(obj.timer);
    }
    else{
      obj.style[attr]=iCur+sheep+'px'
    }
  },30)
}
