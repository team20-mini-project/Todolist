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
            if (todoText && keywordText) {
                const todoList = document.getElementById('todo-items');
                const todoItem = document.createElement('li');
                todoItem.setAttribute('data-keyword', keywordText);
                todoItem.innerHTML = `
                    <span onclick="openEditModal(this)">${todoText}</span>
                    <button onclick="removeTodo(this)">Delete</button>
                `;
                todoList.appendChild(todoItem);
                todoInput.value = '';
                keywordInput.value = '';
                closeModal();
                filterTodos(currentCategory);
            }
        }

        function removeTodo(button) {
            const todoItem = button.parentElement;
            todoItem.remove();
        }

        function openEditModal(span) {
            currentEditItem = span.parentElement;
            document.getElementById('edit-todo').value = span.innerText;
            document.getElementById('edit-todo-keyword').value = currentEditItem.getAttribute('data-keyword');
            document.getElementById('editModal').style.display = "block";
        }

        function closeEditModal() {
            document.getElementById('editModal').style.display = "none";
        }

        function saveTodo() {
            const editInput = document.getElementById('edit-todo');
            const editText = editInput.value.trim();
            const editKeyword = document.getElementById('edit-todo-keyword').value.trim();
            if (editText && editKeyword) {
                currentEditItem.querySelector('span').innerText =

 editText;
                currentEditItem.setAttribute('data-keyword', editKeyword);
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
                if (category === 'Home' || keyword === category) {
                    todos[i].style.display = 'flex';
                } else {
                    todos[i].style.display = 'none';
                }
            }
        }

        // 초기 필터링을 적용합니다.
        filterTodos(currentCategory);