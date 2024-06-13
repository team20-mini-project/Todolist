document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        height: 'auto',
        dateClick: function(info) {
            showCategory(info.dateStr);
        },
        events: []
    });
    calendar.render();


    window.calendar = calendar;
});

let currentEditItem;
let currentCategory = 'Today';

function addCategory() {
    const categoryInput = document.getElementById('new-category');
    const categoryText = categoryInput.value.trim();
    if (categoryText) {
        const categoryList = document.getElementById('category-list');
        const categoryItem = document.createElement('li');
        categoryItem.innerHTML = `
            <span onclick="showCategory('${categoryText}')">${categoryText}</span>
            <button onclick="removeCategory(this)">Delete</button>
        `;
        categoryList.appendChild(categoryItem);
        categoryInput.value = '';
    }
}

function removeCategory(button) {
    const categoryItem = button.parentElement;
    categoryItem.remove();
}

function openModal() {
    document.getElementById('todoModal').style.display = "block";
}

function closeModal() {
    document.getElementById('todoModal').style.display = "none";
}

function addTodo() {
    const todoInput = document.getElementById('new-todo');
    const todoText = todoInput.value.trim();
    const keywordInput = document.getElementById('new-todo-keyword');
    const keywordText = keywordInput.value.trim();
    const dateInput = document.getElementById('new-todo-date');
    const dateText = dateInput.value.trim();
    if (todoText && keywordText && dateText) {
        const todoList = document.getElementById('todo-items');
        const todoItem = document.createElement('li');
        todoItem.setAttribute('data-keyword', keywordText);
        todoItem.setAttribute('data-date', dateText);
        todoItem.innerHTML = `
            <span onclick="openEditModal(this)">${todoText}</span>
            <button onclick="removeTodo(this)">Delete</button>
        `;
        todoList.appendChild(todoItem);

        
        window.calendar.addEvent({
            title: todoText,
            start: dateText
        });

        todoInput.value = '';
        keywordInput.value = '';
        dateInput.value = '';
        closeModal();
        filterTodos(currentCategory);
    }
}

function removeTodo(button) {
    const todoItem = button.parentElement;
    const todoText = todoItem.querySelector('span').innerText;
    const dateText = todoItem.getAttribute('data-date');

    // 달력 이벤트 제거
    const event = window.calendar.getEvents().find(event => event.title === todoText && event.startStr === dateText);
    if (event) {
        event.remove();
    }

    todoItem.remove();
}

function openEditModal(span) {
    currentEditItem = span.parentElement;
    document.getElementById('edit-todo').value = span.innerText;
    document.getElementById('edit-todo-keyword').value = currentEditItem.getAttribute('data-keyword');
    document.getElementById('edit-todo-date').value = currentEditItem.getAttribute('data-date');
    document.getElementById('editModal').style.display = "block";
}

function closeEditModal() {
    document.getElementById('editModal').style.display = "none";
}

function saveTodo() {
    const editInput = document.getElementById('edit-todo');
    const editText = editInput.value.trim();
    const editKeyword = document.getElementById('edit-todo-keyword').value.trim();
    const editDate = document.getElementById('edit-todo-date').value.trim();
    if (editText && editKeyword && editDate) {
        const oldText = currentEditItem.querySelector('span').innerText;
        const oldDate = currentEditItem.getAttribute('data-date');

        // 기존 달력 이벤트 제거
        const oldEvent = window.calendar.getEvents().find(event => event.title === oldText && event.startStr === oldDate);
        if (oldEvent) {
            oldEvent.remove();
        }

        currentEditItem.querySelector('span').innerText = editText;
        currentEditItem.setAttribute('data-keyword', editKeyword);
        currentEditItem.setAttribute('data-date', editDate);

        // 새로운 달력 이벤트 추가
        window.calendar.addEvent({
            title: editText,
            start: editDate
        });

        closeEditModal();
        filterTodos(currentCategory);
    }
}

function showCategory(category) {
    currentCategory = category;
    document.getElementById('category-title').innerText = category + "'s Tasks";
    filterTodos(category);
}

function filterTodos(category) {
    const todoList = document.getElementById('todo-items');
    const todos = todoList.getElementsByTagName('li');
    for (let i = 0; i < todos.length; i++) {
        const keyword = todos[i].getAttribute('data-keyword');
        const date = todos[i].getAttribute('data-date');
        if (category === 'Home' || keyword === category || date === category) {
            todos[i].style.display = 'flex';
        } else {
            todos[i].style.display = 'none';
        }
    }
}

// 초기 필터링을 적용합니다.
filterTodos(currentCategory);