class Todo {
  title;
  content;
  createdAt;
  isDone;
  
  constructor({ title, content = '', createdAt = new Date(), isDone = false }) {
    if (typeof title === 'undefined') {
      new Error('Title is required');
    }
    this.title = title;
    this.content = content;
    this.createdAt = createdAt;
    this.isDone = isDone;
  }

  toggleDone() {
    this.isDone = !this.isDone;
  }
}


window.onload = () => {
  console.log('hi', Todo);

}