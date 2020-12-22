window.onload = () => {
  const LOCAL_STORAGE_KEY = 'todo-list';
  const COLORS = {
    red: '#dc3545',
    green: '#28a745',
    blue: '#007bff',
    yellow: '#ffc107',
    indigo: '#6610f2',
    purple: '#6f42c1',
    pink: '#e83e8c',
    orange: '#fd7e14',
    teal: '#20c997',
    cyan: '#17a2b8',
  };

  // Classes
  class TodoList {
    list = [];

    constructor({ list }) {
      this.list = list;
    }

    add({ todo }) {
      if ( !todo || !todo.title ) {
        return;
      }
      this.list.push(todo);
    }

    toggleTodoDone({ index }) {
      const targetTodo = this.list[index];
      if (!targetTodo ) {
        return;
      }
      targetTodo.toggleDone();
    }
  }

  class Todo {
    id;
    title;
    content;
    createdAt;
    isDone;
    
    constructor({ title, content = '', createdAt = new Date(), isDone = false }) {
      if (typeof title === 'undefined') {
        new Error('Title is required');
      }
      this.id = Date.now();
      this.title = title;
      this.content = content;
      this.createdAt = createdAt;
      this.isDone = isDone;
    }

    toggleDone() {
      this.isDone = !this.isDone;
    }
  }


  // functions
  const checkFormValidation = ({ data: { title = '' }}) => {
    if (title.length === 0) {
      return {key: 'title', message: 'title is required'};
    }
    return {};
  }

  const getRandomColor = () => Object.keys(COLORS)[Math.floor(Math.random(0, 12) * 10)];
  
  const renderTodo = ({ id, title, content, createdAt, isDone }) => {
    if (!id || !title ) {
      return;
    }
    return `
      <li class="card list__item" data-id=${id}>
        <span class="card__label ${getRandomColor()}"></span>
        <h5>
          ${title}
        </h5>
        <h6>
          ${content}
        </h6>
      </li>
    `
  }

  // Dom elements
  const $app = document.querySelector('.todo-app');
  const $form = $app.querySelector('.todo-app__form');
  const $todoList = $app.querySelector('.todo-app__list');



  // Initialize
  const storageList = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
  const todoList = new TodoList({ list: storageList });
  const todoListDomString = todoList.list
    .filter((todo) => todo && todo.title)
    .map(renderTodo)
    .join('');
  $todoList.insertAdjacentHTML('beforeend', todoListDomString);



  // Event
  $form.addEventListener('submit', (event) => {
    event.preventDefault();
    const { currentTarget } = event;
    const $items = currentTarget.querySelectorAll('.form__item');
    const formEntries = Array.prototype.map.call($items, ($item) => {
      const {dataset: { key }} = $item;
      const {value = ''} = $item.querySelector('input, select, textarea');
      return [key, value];
    });
    const formData = Object.fromEntries(formEntries);
    const {key, message} = checkFormValidation({ data: formData });
    if (key) {
      const $invalidItem = currentTarget.querySelector(`.form__item[data-key=${key}]`);
      $invalidItem.insertAdjacentHTML('beforeEnd', `
        <span class="form__error">
          ${message}
        </span>
      `);
      return;
    }
    const newTodo = new Todo(formData);
    todoList.add({ todo: newTodo });
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify(todoList.list),
    );
    $todoList.insertAdjacentHTML(
      'beforeend',
      renderTodo(newTodo),
    );
    
    console.log(todoList);
  });
}
