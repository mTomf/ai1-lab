class Todo {
    constructor() {
        this.todoContainer = document.getElementById('todoItems');
        this.tasks = this.loadFromLocalStorage();
        this.filteredTasks = [...this.tasks];
        this.editingIndex = null;
        this.currentTerm = '';
    }

    filterTasks(term) {
        const trimmedTerm = term.trim().toLowerCase();
        this.currentTerm = trimmedTerm;

        if (trimmedTerm === '') {
            this.filteredTasks = [...this.tasks];
        } else {
            this.filteredTasks = this.tasks.filter(task =>
                task.text.toLowerCase().includes(trimmedTerm)
            );
        }

        this.draw();
    }

    highlightTerm(text) {
        const term = this.currentTerm?.trim();
        if (!term) return text;

        const lowerText = text.toLowerCase();
        const lowerTerm = term.toLowerCase();
        let result = '';
        let startIndex = 0;
        let matchIndex;

        while ((matchIndex = lowerText.indexOf(lowerTerm, startIndex)) !== -1) {
            result += text.slice(startIndex, matchIndex);
            result += `<span class="highlight">${text.slice(matchIndex, matchIndex + term.length)}</span>`;
            startIndex = matchIndex + term.length;
        }

        result += text.slice(startIndex);
        return result;
    }

    draw() {
        this.todoContainer.innerHTML = '';

        this.filteredTasks.forEach((task, index) => {
            const todoDiv = document.createElement('div');
            todoDiv.classList.add('todoItem');

            todoDiv.innerHTML = `
                <p class="todoText">${this.highlightTerm(task.text)}</p>
                <p class="todoDate">${task.date}</p>
                <button class="editButton"><img src="assets/Book.png" alt="edit"></button>
                <button class="deleteButton"><img src="assets/Cauldron.png" alt="delete"></button>
            `;

            const editBtn = todoDiv.querySelector('.editButton');
            editBtn.addEventListener('click', () => this.toggleEditMode(todoDiv, index));

            const deleteBtn = todoDiv.querySelector('.deleteButton');
            deleteBtn.addEventListener('click', () => {
                const realIndex = this.tasks.indexOf(this.filteredTasks[index]);
                this.tasks.splice(realIndex, 1);
                this.saveToLocalStorage();
                this.filterTasks(document.getElementById('searchInput').value);
            });

            this.todoContainer.appendChild(todoDiv);
        });
    }

    toggleEditMode(todoDiv, index) {
        const task = this.filteredTasks[index];
        const textEl = todoDiv.querySelector('.todoText');
        const dateEl = todoDiv.querySelector('.todoDate');
        const editBtn = todoDiv.querySelector('.editButton img');

        if (this.editingIndex !== null && this.editingIndex !== index) {
            this.draw();
            this.editingIndex = null;
        }

        const isEditing = todoDiv.querySelector('input');

        if (!isEditing) {
            this.editingIndex = index;
            textEl.outerHTML = `<input type="text" class="editText" value="${task.text}" minlength="3" maxlength="255">`;
            dateEl.outerHTML = `<input type="date" class="editDate" value="${task.date}" min="${new Date().toISOString().split('T')[0]}">`;
            editBtn.src = 'assets/Writable_Book.png';
        } else {
            const newText = todoDiv.querySelector('.editText').value.trim();
            const newDate = todoDiv.querySelector('.editDate').value;
            const today = new Date().toISOString().split('T')[0];

            if (newText.length < 3 || newText.length > 255) {
                alert("Tekst musi mieć od 3 do 255 znaków");
                return;
            }

            if (newDate < today) {
                alert("Data musi być dzisiejsza lub w przyszłości");
                return;
            }

            const realIndex = this.tasks.indexOf(this.filteredTasks[index]);
            this.tasks[realIndex].text = newText;
            this.tasks[realIndex].date = newDate;

            this.saveToLocalStorage();
            this.filterTasks(document.getElementById('searchInput').value);
            this.editingIndex = null;
        }
    }

    addItem(text, date) {
        this.tasks.push(new TodoItem(text, date));
        this.saveToLocalStorage();

        const currentTerm = document.getElementById('searchInput').value.trim();
        this.filterTasks(currentTerm);
    }

    saveToLocalStorage() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    loadFromLocalStorage() {
        const data = localStorage.getItem('tasks');
        return data ? JSON.parse(data) : [];
    }
}

class TodoItem {
    constructor(text, date) {
        this.text = text;
        this.date = date;
    }
}

const today = new Date().toISOString().split('T')[0];
document.getElementById("dateInput").min = today;

const todoList = new Todo();
todoList.draw();

const form = document.getElementById('todoForm');
form.addEventListener('submit', (event) => {
    event.preventDefault();

    const textValue = document.getElementById('textInput').value.trim();
    const dateValue = document.getElementById('dateInput').value;

    if (textValue.length < 3 || textValue.length > 255) {
        alert("Tekst musi mieć od 3 do 255 znaków!");
        return;
    }

    if (dateValue < today) {
        alert("Data musi być dzisiejsza lub w przyszłości!");
        return;
    }

    todoList.addItem(textValue, dateValue);
    form.reset();
});

const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('input', (e) => {
    todoList.filterTasks(e.target.value);
});
