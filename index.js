window.onload = () => {
  const LOCAL_STORAGE_KEY = 'todo-list';
  const NOTIFY_VISIBLE_CLASS_NAME = 'todo-app__notify__visible';

  const COLOR = {
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
  const PRIORITY = {
    HIGHEST: 'highest',
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low',
    LOWEST: 'lowest',
  };


  // Classes
  class TodoList {
    list = [];

    constructor({ list }) {
      this.list = list.map(todo => new Todo(todo));
    }

    add({ todo }) {
      if ( !todo || !todo.title ) {
        return;
      }
      this.list.push(todo);
    }

    remove({ todoId }) {
      this.list = this.list.filter(({ id }) => id !== todoId);
    }

    updateTodo({ todoId, values }) {
      const targetTodo = this.list.find(({ id }) => id === todoId);
      targetTodo.set(values);
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
    completeAt;
    isDone;
    priority;
    parentId;
    
    constructor({ id, title, content = '', createdAt = new Date(), isDone = false, completeAt, order = 1, priority = PRIORITY.MEDIUM, parentId }) {
      if (typeof title === 'undefined') {
        throw new Error('Title is required');
      }
      this.id = isNumberString(id) ? id : Date.now().toString();
      this.title = title;
      this.content = content;
      this.createdAt = createdAt;
      this.completeAt = completeAt;
      this.isDone = isDone;
      this.priority = priority;
      this.order = isNumberString(order) ? parseInt(order) : 1;
      if (isNumberString(parentId)) {
        this.parentId = parentId;
      }
    }

    set(values) {
      for (const [key, value] of Object.entries(values)) {
        this[key] = value;
      }
    }

    toggleDone() {
      this.isDone = !this.isDone;
    }

    isExpired() {
      return (new Date(this.completeAt) - new Date()) < 0;
    }
  }


  // functions
  const isNumberString = (id) => !isNaN(parseInt(id));
  const checkFormValidation = ({ data: { title = '' }}) => {
    if (title.trim().length === 0) {
      return {key: 'title', message: 'title is required'};
    }
    return {};
  }

  const updateStorage = ({ list }) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
  }

  const onEditTodo = ({ target }) => {
    const { dataset: { id }} = target.closest('.todo');
    const { value, dataset: {key} } = target;
    todoList.updateTodo({ todoId: id, values: {[key]: value }});
    updateStorage({ list: todoList.list });
  }

  const getRandomColor = () => Object.keys(COLOR)[Math.floor(Math.random(0, 12) * 10)];
 
  const renderTodo = ({ id, title, content, completeAt, isDone, priority }) => {
    return `
      <li class="card list__item todo" data-id=${id} draggable=true>
        <span class="card__label ${getRandomColor()}"></span>
        <div class="todo__body">
          <h5 class="todo__title">
            <input class="title__input" data-key="title" value="${title}">
          </h5>
          <div class="row">
            <span class="todo__date">
            <input 
              class="content__complete-at"
              type="date"
              data-key="completeAt"
              value="${completeAt && new Date(completeAt).toISOString().slice(0, 10)}">
            </span>
            <span class=""todo__priority>
              <select
                class="content__priority"
                data-key="priority">
                <option
                  value ="${PRIORITY.HIGHEST}"
                  ${priority === PRIORITY.HIGHEST ? 'selected' : ''}>
                  Highest
                </option>
                <option
                  value ="${PRIORITY.HIGH}"
                  ${priority === PRIORITY.HIGH ? 'selected' : ''}>
                  High
                </option>
                <option
                  value ="${PRIORITY.MEDIUM}"
                  ${priority === PRIORITY.MEDIUM ? 'selected' : ''}>
                  Medium
                </option>
                <option
                  value ="${PRIORITY.LOW}"
                  ${priority === PRIORITY.LOW ? 'selected' : ''}>
                  Low
                </option>
                <option
                  value ="${PRIORITY.LOWEST}"
                  ${priority === PRIORITY.LOWEST ? 'selected' : ''}>
                  Lowest
                </option>
              </select>
            </span>
          </div>
          <p class="todo__content">
            <input class="content__input" data-key="content" value="${content}">
          </p>
          <div class="todo__buttons row">
            <button class="todo__delete">Delete</button>
            ${
              isDone
                ? `<button class="todo__done todo__done--clear">Incomplete</button>`
                : `<button class="todo__done">Complete</button>`
            }
          </div>
        </div>
      </li>
    `
  }

  const renderTodos = ({ todoList, parentId }) => {
    if (!todoList?.list) {
      return;
    }
    const { list } = todoList;
    const todoListDomString = list
      .filter((todo) => todo?.id && parentId === todo.parentId)
      .sort((prev, next) => prev.order - next.order)
      .map(renderTodo)
      .join('');
    $todoList.innerHTML = todoListDomString;

    $todoList.dataset.id = parentId;
  
    $moveParent.classList[parentId ? 'add' : 'remove']('move-parent__visible');

    const parentTodo = list.find(({ id }) => id === parentId);
    $parentName.innerText = parentTodo ? `${parentTodo.title}'s ` : '';
  }

  const resetFields = () => {
    const formInputs = $form.querySelectorAll('.form__input');
    for (const $input of formInputs) {
      if ($input.id === 'priority') {
        $input.value = PRIORITY.MEDIUM;
        return;
      }
      $input.value = '';
    }
  }

  showExpiredTodos = ({ todoList }) => {
    const content = todoList.list
      .filter((todo) => todo.isExpired())
      .map(({ title }) => `<div>${title}</div>`)
      .join('');
    if (content.length > 0) {
      $notify.classList.add(NOTIFY_VISIBLE_CLASS_NAME);
      $notifyContent.innerHTML = content;
    }
  }



  // Dom elements
  const $app = document.querySelector('.todo-app');
  const $form = $app.querySelector('.todo-app__form');
  const $moveParent = $app.querySelector('.move-parent');
  const $parentName = $app.querySelector('.parent-name');
  const $todoList = $app.querySelector('.todo-app__list');
  const $notify = $app.querySelector('.todo-app__notify');
  const $notifyCloseButton = $notify.querySelector('.notify__close-button');
  const $notifyContent = $notify.querySelector('.notify__content');



  // Initialize
  // loading
  setTimeout(() => {
    $app.classList.remove('todo-app__loading');
  }, 100);
  const storageList = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
  const todoList = new TodoList({ list: storageList });
  renderTodos({ todoList });
  showExpiredTodos({ todoList });



  // Event
  $notifyCloseButton.addEventListener('click', () => {
    $notify.classList.remove(NOTIFY_VISIBLE_CLASS_NAME);
  });
  
  $form.addEventListener('submit', (event) => {
    event.preventDefault();
    for (const $error of $form.querySelectorAll('.form__error')) {
      $error.remove();
    }
  
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
  
    if(!confirm('Want to add?')) {
      return;
    }
    resetFields();
    const newTodo = new Todo({ ...formData, parentId: $todoList.dataset.id });
    todoList.add({ todo: newTodo });
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify(todoList.list),
    );
    $todoList.insertAdjacentHTML(
      'beforeend',
      renderTodo(newTodo),
    );
  });

  // edit
  $todoList.addEventListener('focusout', (event) => {
    const { target } = event;
    if (target.dataset.key && target.tagName !== 'BUTTON') {
      onEditTodo(event);
    }
  });

  // edit
  $todoList.addEventListener('keydown', (event) => {
    const { target, target: { dataset: { key } }, code } = event;
    if (key && code === 'Enter') {
      onEditTodo(event);
      target.blur();
    }
  });

  $todoList.addEventListener('click', ({ target }) => {
    const $todo = target.closest('.todo');
    if (!$todo) {
      return;
    }
    const { dataset: { id: todoId }} = $todo;
    // toggle done
    if (target.classList.contains('todo__done')) {
      const isDone = target.classList.contains('todo__done--clear');
      todoList.updateTodo({
        todoId,
        values: { isDone: !isDone }
      });
      updateStorage({ list: todoList.list });
      target.innerText = isDone ? 'Complete' : 'Incomplete';
      (target.classList[isDone ? 'remove' : 'add'])('todo__done--clear');
      return;
    }
    // delete todo
    if (target.classList.contains('todo__delete') && confirm('Want to delete?')) {
      todoList.remove({ todoId });
      updateStorage({ list: todoList.list });
      $todo.remove();
      return;
    }
    // move
    if (target.classList.contains('todo')) {
      renderTodos({ todoList: todoList, parentId: todoId });
      return;
    }
  });

  // drag & sort
  $todoList.addEventListener('drag', (event) => {
    const {target, clientX, clientY} = event;
    let swapItem = document.elementFromPoint(clientX, clientY) || target;
    if (swapItem.parentNode === $todoList) {
      swapItem = swapItem !== target.nextSibling
        ? swapItem
        : swapItem.nextSibling;
      $todoList.insertBefore(target, swapItem);
    }
  });

  $todoList.addEventListener('dragover', (event) => {
    event.preventDefault();
  }, false);

  $todoList.addEventListener('drop', () => {
    const todos = $todoList.querySelectorAll('li');
    for (let index = 0; index < todos.length; index++) {
      const {dataset: {id}} = todos[index];
      todoList.updateTodo({ todoId: id, values: {order: index + 1}});
    }
    updateStorage({ list: todoList.list });
  });

  // move to parent
  $moveParent.addEventListener('click', () => {
    const {parentId} = todoList.list.find(({ id }) => id === $todoList.dataset.id);
    renderTodos({ todoList: todoList, parentId });
  });
}

