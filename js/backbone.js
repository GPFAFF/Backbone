
  

//Javascript code


  // MODEL
 
      var app = {};

      app.Todo = Backbone.Model.extend({
        defaults: {
          title: '',
          completed: false
        },
        toggle: function(){
          this.save({ completed: !this.get('completed')});
        }
      });

/*Collection*/
      app.TodoList = Backbone.Collection.extend({
        model: app.Todo,
        localStorage: new Store("backbone-todo"),
        completed: function(){
          return this.filter(function (todo) {
            return todo.get('completed');
          });
        },
        remaining: function(){
          return this.without.apply(this, this.completed() );
        }
      });
      app.todolist = new app.TodoList();

/*VIEW*/
    app.TodoView = Backbone.View.extend({
      tagName: 'li',
      template: _.template($('#item-template').html()),
      render: function(){
        this.$el.html(this.template(this.model.toJSON()));
        this.input = this.$('.edit');
        return this;
      },
      initialize: function(){
        this.model.on('change', this.render, this);
        this.model.on('destroy', this.remove, this);
      },
      events: {
        'dblclick label' : 'edit',
        'keypress .edit' : 'updateOnEnter',
        'blur .edit' : 'close',
        'click .toggle': 'toggleCompleted',
        'click .destroy': 'destroy'
      },
      edit: function(){
        this.$el.addClass('editing');
        this.input.focus();
      },
      close: function (){
        var value = this.input.val().trim();
        if (value) {
          this.model.save({title:value});
        }
        this.$el.removeClass('editing');
      },
      updateOnEnter: function(e){
        if(e.which == 13){
          this.close();
        }
      },
      toggleCompleted: function(){
          this.model.destroy();
        },
        destroy: function(){
          this.model.destroy();
      }
    });

    app.AppView = Backbone.View.extend({
      el: "#todoapp",
      initialize: function () {
        this.input = this.$('#new-item');

        app.todolist.on('add', this.addOne, this);
        app.todolist.on('reset', this.addAll, this);
        app.todolist.fetch();
      },
      events: {
        'keypress #new-item': 'createTodoOnEnter'
      },
      createTodoOnEnter : function(e){
        if (e.which !== 13 || !this.input.val().trim() ){
          return;
        }
        app.todolist.create(this.newAttributes());
        this.input.val('');
      },
        addOne: function (todo){
          var view = new app.TodoView({model: todo});
          $('#todo-list').append(view.render().el);
        },
        addAll: function (){
          this.$("#todo-list").html('');
          switch(window.filter){
            case 'pending':
            _.each(app.todolist.remaining(), this.addOne);
            break;
            case 'completed':
            _.each(app.todolist.completed(), this.addOne);
            break;
            default:
            app.todolist.each(this.addOne, this);
            break;
          }
        },
        newAttributes: function(){
          return{
            title: this.input.val().trim(),
            completed: false
          }
        }
    });

      /* var AppView = Backbone.View.extend({
      // el - stands for element. Every view has a element associate in with HTML
      //      content will be rendered.
      el: $('#container'),
      // It's the first function called when this view it's instantiated.
      template: _.template("<h3> Hello <%= who %></h3>"),
      initialize: function(){
        this.render();
      },
      // $el - it's a cached jQuery object (el), in which you can use jQuery functions
      //       to push content. Like the Hello World in this case.
      render: function(){
        this.$el.html(this.template({who: 'Make me some fucking eggs'}));
      }
    });*/

app.Router = Backbone.Router.extend({
  routes: {
    '*filter' : 'setFilter'
  },
  setFilter: function(params){
    console.log('app.router.params = ' + params);
    window.filter = params.trim() || '';
    app.todolist.trigger('reset');
  }
})

  app.router = new app.Router();
  Backbone.history.start();
  app.appView= new app.AppView();

