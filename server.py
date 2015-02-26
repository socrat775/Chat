import tornado.web
import tornado.websocket
import tornado.ioloop
import tornado.httpserver
from tornado import gen
import json
import pymongo
import os


class MainHandler(tornado.web.RequestHandler):
    def get(self): self.render("main.html")


class Application(tornado.web.Application):
    def __init__(self):
        handlers = [(r'/', MainHandler), (r'/main/', WSMainHandler)]
        settings = dict(template_path = os.path.join(os.path.dirname(__file__), 'template'),
                        static_path = os.path.join(os.path.dirname(__file__), 'static'))
        connect = pymongo.Connection('localhost', 27017)
        self.db = connect.db_chat
        tornado.web.Application.__init__(self, handlers, **settings)


class WSMainHandler(tornado.websocket.WebSocketHandler):
    def open(self):
       self.functions = {'CREATE_USER': self.create_user}
       not_cookie, have_cookies = {'USER': {'identification': True}}, {'ROOMS': {'show_rooms': True}}
       data = not_cookie if not self.get_cookie('COOKIE') else have_cookies
       self.write_message(json.dumps(data))

    @gen.coroutine
    def on_message(self, message):
       message = json.loads(message)
       for key in message:
          if key in self.functions:
             yield self.functions[key](message[key])
          else:
             self.write_message(json.dump({'ERRORS': ['handler_error_server']}))

    def on_close(self):
       print ("Close main page")


    def create_user(self, data_of_user):
        if 'login' and 'user_hash' and 'mail' in data_of_user and len(data_of_user) == 3:
           collection_users = self.application.db.users
           error = [key for key in data_of_user if collection_users.find_one({key:data_of_user[key]})]

           if error:
              self.write_message(json.dumps({'ERRORS': error}))
           else:
              collection_users.insert(data_of_user)
              self.write_message(json.dumps({'COOKIE': ["it'sveryhardcookies1", 300]}))

#{
# user:HASH_SHA-1, 
# mail:"name@name.x", 
# rooms:[id1, id2, id3], //link on the rooms
# data_of_user: {}
#}
if __name__ == "__main__":
   try:
      server = tornado.httpserver.HTTPServer(Application())
      server.listen(8888)
      tornado.ioloop.IOLoop.instance().start()
   except KeyboardInterrupt: print("\n")
