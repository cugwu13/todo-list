import './style.css';
import { compareAsc, isSameWeek, format, parse } from 'date-fns';

const ToDoList = (() => {
    let uniqueId = 0;

    const getItem = (uniqueId, folder, title, description, dueDate, priority, notes) => {
        const item = new ToDo(uniqueId, folder, title, description, dueDate, priority, notes)
        folders[folder].push(item);

        return item;
    };

    let folders = {
        general: [],
        completed: [],
    };
    
    function ToDo(uniqueId, folder, title, description, dueDate, priority, notes) {
        this.id = uniqueId;
        this.folder = folder;
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.priority = priority;
        this.notes = notes;
        this.checklist = [];
    }
    
    ToDo.prototype.addToChecklist = function(items) {
        for (let item of items) {
            this.checklist.push(item);
        }
    };

    return { uniqueId, getItem, folders };
})();

const DOMController = (() => {
    const insertAfter = (newNode, refNode) => {
        refNode.parentNode.insertBefore(newNode, refNode.nextSibling);
    };

    const changeDateFormat = (date) => {
        if (date === '') return date;
        const dateArr = date.split("-");
        const year = parseInt(dateArr[0]);
        const month = parseInt(dateArr[1]) - 1;
        const day = parseInt(dateArr[2]);

        return format(new Date(year, month, day), 'MM/dd/yyyy')
    };

    const fadeIn = (el) => {
        el.style.opacity = 0;
        el.style.display = 'block';
        (function fade() {
            let val = parseFloat(el.style.opacity);
            if (!((val += .1) > 1)) {
                el.style.opacity = val;
                requestAnimationFrame(fade)
            }
        })();
    };

    const fadeOut = (el) => {
        el.style.opacity = 1;
        (function fade() {
            if ((el.style.opacity -= .1) < 0) {
                el.style.display = 'none';
                el.parentElement.removeChild(el);
            } else {
                requestAnimationFrame(fade);
            }
        })();
    };

    const search = () => {
        const searchBar = document.querySelector('#search');
        keyDownEL();

        function keyDownEL() {
            document.addEventListener('keyup', () => {
                if (searchBar === document.activeElement) {
                    const query = searchBar.value;
                    AppController.querySearch(query);
                }
            });
        };
    };

    const showSidebar = () => {
        const menuEL = btn => {
            btn.addEventListener('click', () => {
                flexSidebar();
            });
        };

        const flexSidebar = () => {
            const sidebar = document.querySelector('.sidebar');
            const paddingLeft = '14px';
            sidebar.style.cssText = `margin-left: 0`;
        };

        const menu = document.querySelector('.fa-bars');
        menuEL(menu);
    };

    const hideSidebar = () => {
        const hideEL = btn => {
            btn.addEventListener('click', () => {
                shrinkSidebar();
            });
        };
        const shrinkSidebar = () => {
            const sidebar = document.querySelector('.sidebar');
            sidebar.style.cssText = 'margin-left: -12rem;';
        };

        const hideBtn = document.querySelector('#close-sidebar');
        hideEL(hideBtn);
    };

    const addTask = () => {
        const createInputDiv = (elementType, idName, labelName, cols=null, rows=null, type=null) => {
            const div = document.createElement('div');
            const label = document.createElement('label');
            const el = document.createElement(elementType);
            if (idName === 'title') el.setAttribute('autofocus', 'autofocus');
            el.id = el.name = idName;
            if (cols && rows) {
                el.setAttribute('cols', cols);
                el.setAttribute('rows', rows);
            };
            if (type) el.setAttribute('type', type);
            if (type === 'date') {
                let today = new Date().toISOString().slice(0, 10)
                el.setAttribute('min', today);
            };
            label.setAttribute('for', idName);
            label.innerText = labelName;
            div.append(label, el);

            return div;
        };

        const createSelectDiv = (selectId, ...args) => {
            const div = document.createElement('div');
            const select = document.createElement('select');
            const label = document.createElement('label');
            select.name = selectId;
            select.id = selectId;
            label.setAttribute('for', selectId);
            label.innerText = selectId[0].toUpperCase() + selectId.slice(1);
            const defaultVal = document.createElement('option');
            defaultVal.setAttribute('selected', 'selected');
            defaultVal.setAttribute('hidden', 'hidden');
            defaultVal.setAttribute('value', '');
            defaultVal.innerText = 'None';
            select.appendChild(defaultVal);
            args.forEach(arg => {
                const option = document.createElement('option');
                option.setAttribute('value', arg);
                option.innerText = arg[0].toUpperCase() + arg.slice(1);
                select.appendChild(option);
            });
            div.append(label, select)

            return div;
        };

        const createToDoField = () => {
            const cancelBtnEL = () => {
                cancelBtn.addEventListener('click', () => fadeOut(document.querySelector('.backdrop')));
            };

            const addBtnEL = () => {
                addBtn.addEventListener('click', () => {
                    const item = {
                        title: document.querySelector('#title').value,
                        description: document.querySelector('#description').value,
                        dueDate: changeDateFormat(document.querySelector('#duedate').value),
                        priority: document.querySelector('#priority').value,
                        notes: document.querySelector('#notes').value
                    };
                    AppController.placeItemInList(item);
                    fadeOut(document.querySelector('.backdrop'));
                });
            };
            const backdrop = document.createElement('div');
            const div = document.createElement('div');
            const cancelBtn = document.createElement('i');
            const title = createInputDiv('input', 'title', 'Title');
            const description = createInputDiv('textarea', 'description', 'Description', 8, 5);
            const dueDate = createInputDiv('input', 'duedate', 'Due Date', null, null, 'date');
            const priority = createSelectDiv('priority', ...['high', 'medium', 'low']);
            const notes = createInputDiv('textarea', 'notes', 'Notes', 8, 5);
            const addBtn = document.createElement('button');

            backdrop.classList.add('backdrop');
            div.classList.add('todo-popup');
            cancelBtn.classList.add('cancel-btn', 'far', 'fa-circle-xmark');
            cancelBtnEL();
            addBtn.classList.add('confirm-add-task');
            addBtn.innerText = 'Add';
            addBtnEL();
            div.append(cancelBtn, title, description, dueDate, priority, notes, addBtn);
            backdrop.appendChild(div);

            return backdrop;
        };

        const addTaskEL = () => {
            const addTask = document.querySelector('#add-task');
            addTask.addEventListener('click', () => {
                document.querySelector('.main').appendChild(createToDoField());
                const backdrop = document.querySelector('.backdrop');
                fadeIn(backdrop);
            });
        }

        addTaskEL();
    };

    const showDetails = item => {
        const dropDownEL = el => {
            const showSecondaryDetails = () => {
                const container = document.createElement('div');
                const description = document.createElement('p');
                const descriptionLabel = document.createElement('b');
                const priority = document.createElement('p');
                const priorityLabel = document.createElement('b');
                const notes = document.createElement('p');
                const notesLabel = document.createElement('b');

                descriptionLabel.innerText = 'Description: ';
                priorityLabel.innerText = 'Priority: ';
                notesLabel.innerText = 'Notes: ';
                description.append(descriptionLabel, item.description);
                priority.append(priorityLabel, item.priority === '' ? '' : item.priority[0].toUpperCase() + item.priority.slice(1));
                notes.append(notesLabel, item.notes);
                container.append(description, priority, notes);

                return container;
            };
            el.addEventListener('click', () => {
                el.parentElement.insertBefore(showSecondaryDetails(), el);
                hideDetails(el, item);
            });
        }
        const div = document.createElement('div');
        const dropDown = document.createElement('i');

        dropDownEL(dropDown);
        dropDown.classList.add('fa-solid', 'fa-circle-down');
        div.classList.add('secondary-details');
        div.appendChild(dropDown);

        return div;
    };

    const hideDetails = (el, item) => {
        const collapseEL = el => {
            el.addEventListener('click', () => {
                const details = el.previousSibling;
                const grandParent = details.parentElement.parentElement;

                grandParent.removeChild(details.parentElement);
                grandParent.appendChild(showDetails(item));
            });
        };
        const collapse = document.createElement('i');
        collapse.classList.add('fa-solid', 'fa-circle-up');
        el.parentElement.appendChild(collapse);
        collapseEL(collapse);
        el.parentElement.removeChild(el);
    };

    const displayItems = (item, completed=false) => {
        const itemRow = (item) => {
            const container = document.createElement('div');
            const div = document.createElement('div');
            const checkBox = document.createElement('i');
            const title = document.createElement('p');
            const description = document.createElement('p');
            const dueDate = document.createElement('p');
            const priority = document.createElement('p');
            const notes = document.createElement('p');
            const folder = document.createElement('p');
            const deleteItem = document.createElement('i');

            checkBox.classList.add('fa-solid', 'fa-circle', 'check-task');
            checkBoxEL(checkBox);
            title.innerText = item.title;
            description.innerText = item.description;
            dueDate.innerText = item.dueDate === '' ? '' : format(item.dueDate, 'MM/dd/yyyy');
            priority.innerText = item.priority === '' ? '' : item.priority[0].toUpperCase() + item.priority.slice(1);
            notes.innerText = item.notes;
            folder.innerText = item.folder;
            deleteItem.classList.add('fa-solid', 'fa-trash-can');
            deleteBtnEL(deleteItem);
            container.classList.add('todo-task');
            div.classList.add('primary-details');
            div.dataset.id = item.id;
            completed === false ? div.append(checkBox, title, dueDate, deleteItem) :
                    div.append(title);
            container.append(div, showDetails(item));

            return container;
        };
        document.querySelector('.main').appendChild(itemRow(item));
    };

    const checkBoxEL = el => {
        el.addEventListener('click', () => {
            document.body.style.cssText = 'pointer-events: none';
            const checkMark = document.createElement('i');
            checkMark.classList.add('fa-solid', 'fa-check', 'check-mark');
            el.appendChild(checkMark);
            setTimeout(() => {
                fadeOut(el.parentElement.parentElement);
                document.body.style.cssText = 'pointer-events: all';
            }, 400);
            AppController.moveItemToCompleted(el.parentElement);
        });
    };

    const deleteBtnEL = el => {
        el.addEventListener('click', () => {
            const parent = el.parentElement;
            const greatGrandParent = parent.parentElement.parentElement;
            greatGrandParent.removeChild(parent.parentElement);
            AppController.removeItemFromList(parent);
        });
    };

    const clearTaskDisplay = () => {
        const main = document.querySelector('.main');
        const tasks = document.querySelectorAll('.main > *:nth-child(n + 2)');
        for (let task of tasks) {
            main.removeChild(task);
        }
    };

    const folderEL = (el) => {
        el.addEventListener('click', (e) => {
            switchFolders(el.innerText.toLowerCase());
            focusActiveFolder(e);
        });

        const switchFolders = (folderName) => {
            const toggleAddTask = (display) => {
                const addTaskBtn = document.querySelector('#add-task');
                addTaskBtn.style.cssText = `display: ${display};`;
            };
            clearTaskDisplay();
            switch (folderName) {
                case 'completed':
                    toggleAddTask('none');
                    AppController.populateTaskDisplay(folderName);
                    break;
                case 'today':
                    toggleAddTask('none');
                    break;
                case 'this week':
                    toggleAddTask('none');
                    break;
                case 'no date':
                    toggleAddTask('none');
                    break;
                default:
                    toggleAddTask('visible');
                    AppController.populateTaskDisplay(folderName);
            };
        };
    };

    const loadLocalFolders = () => {
        const localFolders = AppController.localFolders();
        for (let folder of localFolders) {
            const folderName = folder[0].toUpperCase() + folder.slice(1);
            folderToDOM(folderName);
        }
    };

    const getFolders = () => {
        const folders = document.querySelectorAll('.folder');
        folders.forEach(folder => folderEL(folder));
    };

    const focusActiveFolder = (e) => {
        const folders = document.querySelectorAll('.folder');
        folders.forEach(folder => {
            if (folder.innerText.toLowerCase() == e.target.innerText.toLowerCase()) {
                folder.classList.add('active-folder');
            } else {
                folder.classList.remove('active-folder');
            }
        });
    };

    const folderToDOM = (folderName) => {
        const createBTn = document.querySelector('#create-folder');
        const folder = document.createElement('a');
        folder.classList.add('folder');
        folder.innerText = folderName;
        folderEL(folder);
        insertAfter(folder, createBTn);
    };

    const createFolder = () => {
        const createBTn = document.querySelector('#create-folder');
        createBTn.addEventListener('click', () => {
            insertAfter(folderInput(), createBTn);
            document.body.style.cssText = 'pointer-events: none';
            document.querySelector('.folder-input').style.cssText = 'pointer-events: all';
            confirmEL();
            cancelEL();
        });

        const folderInput = () => {
            const div = document.createElement('div');
            const input = document.createElement('input');
            const confirm = document.createElement('button');
            const cancel = document.createElement('button');
            input.name = 'new-folder';
            input.id = 'new-folder';
            confirm.innerText = 'Confirm';
            cancel.innerText = 'Cancel';
            div.classList.add('folder-input');
            div.append(input, confirm, cancel);

            return div;
        };

        const confirmEL = () => {
            const btn = document.querySelector('.folder-input > button:nth-child(2)');
            btn.addEventListener('click', () => {
                const input = btn.parentElement.firstChild;
                if (input.value !== '') {
                    folderToDOM(input.value);
                    AppController.addFolder(input.value.toLowerCase());
                }
                btn.parentElement.parentElement.removeChild(btn.parentElement);
                document.body.style.cssText = 'pointer-events: all';
            });
        };

        const cancelEL = () => {
            const btn = document.querySelector('.folder-input > button:nth-child(3)');
            btn.addEventListener('click', () => {
                btn.parentElement.parentElement.removeChild(btn.parentElement);
                document.body.style.cssText = 'pointer-events: all';
            });
        };
    };

    const dateSpecificTasks = () => {
        loadTodayTasks();
        loadWeekTasks();
        loadDatelessTasks();

        function loadTodayTasks() {
            const todayFolder = document.querySelector('.today');
            todayFolder.addEventListener('click', () => AppController.loadTodayTasks());
        };

        function loadWeekTasks() {
            const weekFolder = document.querySelector('.this-week');
            weekFolder.addEventListener('click', () => AppController.loadWeekTasks());
        };

        function loadDatelessTasks() {
            const datelessFolder = document.querySelector('.no-date');
            datelessFolder.addEventListener('click', () => AppController.loadDatelessTasks());
        };
    };

    return { showSidebar, hideSidebar, search, addTask, displayItems, clearTaskDisplay, loadLocalFolders, getFolders,
            createFolder, dateSpecificTasks };
})();

const AppController = (() => {
    let currentFolder = 'general';

    const stringToDate = date => {
        const dateArr = date.split("/");
        const year = parseInt(dateArr[2]);
        const month = parseInt(dateArr[0]) - 1;
        const day = parseInt(dateArr[1]);

        return new Date(year, month, day);
    };

    const placeItemInList = item => {
        const dueDate = item.dueDate === '' ? '' : stringToDate(item.dueDate);
        ToDoList.getItem(ToDoList.uniqueId, currentFolder, item.title, item.description, dueDate, item.priority, item.notes);
        updateDOMList();
        ToDoList.uniqueId++;
        populateStorage();
    };

    const removeItemFromList = el => {
        const elId = parseInt(el.dataset.id);
        const index = ToDoList.folders[currentFolder].map(item => item.id).indexOf(elId);
        const removedItem = ToDoList.folders[currentFolder].splice(index, 1)[0];
        populateStorage();
        
        return removedItem;
    };

    const moveItemToCompleted = el => {
        const item = removeItemFromList(el);
        ToDoList.getItem(item.id, 'completed', item.title, item.description, item.dueDate, item.priority, item.notes);
        populateStorage();
    };

    const updateDOMList = () => {
        const arr = ToDoList.folders[currentFolder];
        DOMController.displayItems(arr[arr.length - 1]);
    };

    const populateTaskDisplay = folderName => {
        currentFolder = folderName;
        const arr = ToDoList.folders[currentFolder];
        for (let i = 0; i < arr.length; i++) {
            folderName == 'completed' ? DOMController.displayItems(arr[i], true) :  DOMController.displayItems(arr[i]);
        }
    };

    const addFolder = folderName => {
        ToDoList.folders[folderName] = [];
        populateStorage();
    };

    const querySearch = query => {
        DOMController.clearTaskDisplay();
        if (query === '' || query[0] == ' ') {
            populateTaskDisplay(currentFolder);
        } else {
            for (let item of ToDoList.folders[currentFolder]) {
                if (item.title.toLowerCase().includes(query.toLowerCase())) {
                    currentFolder == 'completed' ? DOMController.displayItems(item, true) :  DOMController.displayItems(item);
                }
            }
        }
    };

    const loadTodayTasks = () => {
        DOMController.clearTaskDisplay();
        const arr = [];
        const date = new Date();
        const today = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
        for (let folder in ToDoList.folders) {
            if (folder !== 'completed') {
                for (let item of ToDoList.folders[folder]) {
                    if (item.dueDate !== '') {
                        const dueDate = `${item.dueDate.getMonth() + 1}/${item.dueDate.getDate()}/${item.dueDate.getFullYear()}`;
                        if (dueDate === today) {
                            arr.push(item);
                        };
                    }
                }
            }
        }
        for (let item of arr) {
            DOMController.displayItems(item);
        }
    };

    const localFolders = () => {
        const folders = [];
        for (let folder in ToDoList.folders) {
            if (folder !== 'general' && folder !== 'completed') {
                folders.push(folder);
            }
        }

        return folders;
    };

    const loadWeekTasks = () => {
        DOMController.clearTaskDisplay();
        const arr = [];
        const date = new Date();
        for (let folder in ToDoList.folders) {
            if (folder !== 'completed') {
                for (let item of ToDoList.folders[folder]) {
                    if (item.dueDate !== '') {
                        if (isSameWeek(date, item.dueDate)) {
                            arr.push(item);
                        };
                    }
                }
            }
        }
        for (let item of arr) {
            DOMController.displayItems(item);
        }
    };

    const loadDatelessTasks = () => {
        DOMController.clearTaskDisplay();
        const arr = [];
        for (let folder in ToDoList.folders) {
            if (folder !== 'completed') {
                for (let item of ToDoList.folders[folder]) {
                    if (item.dueDate === '') {
                        arr.push(item);
                    };
                }
            }
        }
        for (let item of arr) {
            DOMController.displayItems(item);
        }
    };

    const parseLocalStorage = data => {
        const stringToDate = dueDate => {
            return dueDate === '' ? '' : new Date(dueDate);
        }

        const newData = JSON.parse(data);
        for (let folder in newData) {
            for (let item of newData[folder]) {
                item.dueDate = stringToDate(item.dueDate);
            }
        }

        return newData;
    };

    const loadLocalStorage = () => {
        if (localStorage.getItem('userData')) {
            const rawUserData = localStorage.getItem('userData');
            const parsedUserData = parseLocalStorage(rawUserData);

            for (let folder in parsedUserData) {
                ToDoList.folders[folder] = parsedUserData[folder];
            }
        }
    };

    const populateStorage = () => {
        localStorage.setItem('userData', JSON.stringify(ToDoList.folders));
    };

    const runApp = () => {
        loadLocalStorage();
        populateTaskDisplay('general');
        DOMController.loadLocalFolders();
        DOMController.search();
        DOMController.addTask();
        DOMController.getFolders();
        DOMController.createFolder();
        DOMController.dateSpecificTasks();
        DOMController.showSidebar();
        DOMController.hideSidebar();
    };

    return { currentFolder, placeItemInList, moveItemToCompleted, removeItemFromList,
                    populateTaskDisplay, addFolder, querySearch, loadTodayTasks, loadWeekTasks,
                    localFolders, loadDatelessTasks, runApp };
})();


AppController.runApp();
