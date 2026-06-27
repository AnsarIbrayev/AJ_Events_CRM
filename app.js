$(document).ready(function() {
    
    // 1. ИНИЦИАЛИЗАЦИЯ И LOCALSTORAGE
    // Реалистичный массив данных, перемешанный как на настоящем складе
    let defaultData = [
        { id: 104, name: "Проектор Epson EB-X41", category: "Видео", desc: "В кейсе, с пультом", qty: 3, status: "В ремонте" },
        { id: 112, name: "Баннер Roll-up 2х0.8м", category: "Декорации", desc: "Каркас без полотна", qty: 15, status: "На складе" },
        { id: 101, name: "Радиомикрофон Shure SM58", category: "Звук", desc: "База + 2 микрофона", qty: 12, status: "На складе" },
        { id: 109, name: "Световая голова Beam 230W", category: "Свет", desc: "В двойных кейсах", qty: 12, status: "На мероприятии" },
        { id: 115, name: "Конструкция для Press-wall", category: "Декорации", desc: "Трубы Joker (3x2 м)", qty: 5, status: "На складе" },
        { id: 103, name: "Активная колонка JBL EON615", category: "Звук", desc: "Со стойками и кабелями", qty: 6, status: "На складе" },
        { id: 106, name: "LED-экран кабинет 500х500", category: "Видео", desc: "Шаг пикселя P3.91", qty: 40, status: "На мероприятии" },
        { id: 111, name: "DMX-пульт GrandMA2", category: "Свет", desc: "Основной пульт управления", qty: 1, status: "В ремонте" },
        { id: 113, name: "Красная ковровая дорожка", category: "Декорации", desc: "Длина 10 метров, ширина 2м", qty: 3, status: "На складе" },
        { id: 102, name: "Цифровой микшер Behringer X32", category: "Звук", desc: "В жестком кейсе", qty: 2, status: "На мероприятии" },
        { id: 108, name: "LED-прожектор RGB PAR", category: "Свет", desc: "Архитектурная подсветка", qty: 24, status: "На складе" },
        { id: 116, name: "Подиум сценический 2х1м", category: "Декорации", desc: "Высота ножек 40 см", qty: 18, status: "На мероприятии" },
        { id: 105, name: "Плазменная панель Samsung 65'", category: "Видео", desc: "Напольная стойка в комплекте", qty: 4, status: "На складе" },
        { id: 110, name: "Генератор тяжелого дыма", category: "Свет", desc: "Жидкость залита на 50%", qty: 2, status: "На складе" },
        { id: 107, name: "Видеомикшер Blackmagic ATEM", category: "Видео", desc: "Для онлайн-трансляций", qty: 1, status: "На складе" },
        { id: 114, name: "Стойка ограждения (золото)", category: "Декорации", desc: "С красным бархатным канатом", qty: 20, status: "На мероприятии" }
    ];

    // Меняем ключ на v3, чтобы браузер сбросил старый кэш и загрузил наш новый перемешанный список
    let inventory = JSON.parse(localStorage.getItem('crm_inventory_v3')) || defaultData;
    let nextId = parseInt(localStorage.getItem('crm_nextId_v3')) || 117;

    // Функция сохранения данных в память браузера
    function saveDataToStorage() {
        localStorage.setItem('crm_inventory_v3', JSON.stringify(inventory));
        localStorage.setItem('crm_nextId_v3', nextId.toString());
    }

    // 2. ОТРИСОВКА ИНТЕРФЕЙСА
    function renderTable(data) {
        let tbody = $('#inventoryTable');
        tbody.empty();

        if(data.length === 0) {
            tbody.append('<tr><td colspan="7" class="text-center text-muted">Ничего не найдено</td></tr>');
            return;
        }

        // ДОБАВЛЯЕМ index В ФУНКЦИЮ, чтобы считать номера строк
        data.forEach(function(item, index) { 
            let statusBadge = '';
            if (item.status === 'На складе') statusBadge = '<span class="badge bg-success">На складе</span>';
            else if (item.status === 'На мероприятии') statusBadge = '<span class="badge bg-warning text-dark">На мероприятии</span>';
            else statusBadge = '<span class="badge bg-danger">В ремонте</span>';

            let description = item.desc ? item.desc : '<span class="text-muted">-</span>';

            let row = `
                <tr>
                    <td>${index + 1}</td> <!-- Выводим порядковый номер вместо ID -->
                    <td class="fw-bold">${item.name}</td>
                    <td>${item.category}</td>
                    <td><small>${description}</small></td>
                    <td>${item.qty} шт.</td>
                    <td>${statusBadge}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary edit-btn me-1" data-id="${item.id}" title="Редактировать">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${item.id}" title="Удалить">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            tbody.append(row);
        });

        // Статистика всегда считается по всей базе (inventory)
        $('#totalItems').text(inventory.length);
        let available = inventory.filter(i => i.status === 'На складе').length;
        $('#availableItems').text(available);
    }

    renderTable(inventory); // Рисуем таблицу при загрузке

    // 3. ФИЛЬТРАЦИЯ И ПОИСК
    function applyFilters() {
        let searchText = $('#searchInput').val().toLowerCase();
        let catFilter = $('#filterCategory').val();
        let statFilter = $('#filterStatus').val();

        let filteredData = inventory.filter(function(item) {
            // Ищем по имени, описанию ИЛИ по ID
            let matchText = item.name.toLowerCase().includes(searchText) || 
                            (item.desc && item.desc.toLowerCase().includes(searchText)) ||
                            item.id.toString().includes(searchText); 
            
            // Проверяем совпадение с селекторами
            let matchCategory = (catFilter === "All") || (item.category === catFilter);
            let matchStatus = (statFilter === "All") || (item.status === statFilter);

            return matchText && matchCategory && matchStatus;
        });

        renderTable(filteredData);
    }

    // Слушаем изменения в поиске и выпадающих списках
    $('#searchInput').on('keyup', applyFilters);
    $('#filterCategory, #filterStatus').on('change', applyFilters);


    // 4. ДОБАВЛЕНИЕ И РЕДАКТИРОВАНИЕ
    $('#openAddModalBtn').click(function() {
        $('#modalTitle').text('Новое оборудование');
        $('#itemForm')[0].reset();
        $('#itemId').val('');
        $('#itemModal').modal('show');
    });

    $('#inventoryTable').on('click', '.edit-btn', function() {
        let idToEdit = $(this).data('id');
        let item = inventory.find(i => i.id === idToEdit); 
        
        if (item) {
            $('#modalTitle').text('Редактировать оборудование');
            $('#itemId').val(item.id); 
            $('#itemName').val(item.name);
            $('#itemCategory').val(item.category);
            $('#itemDesc').val(item.desc);
            $('#itemQty').val(item.qty);
            $('#itemStatus').val(item.status);
            $('#itemModal').modal('show');
        }
    });

    $('#saveItemBtn').click(function() {
        let id = $('#itemId').val();
        let name = $('#itemName').val();
        let category = $('#itemCategory').val();
        let desc = $('#itemDesc').val();
        let qty = $('#itemQty').val();
        let status = $('#itemStatus').val();

        if (name === "" || qty === "") {
            alert("Пожалуйста, заполните обязательные поля!");
            return;
        }

        if (id) {
            // Обновляем
            let itemIndex = inventory.findIndex(i => i.id == id);
            if (itemIndex !== -1) {
                inventory[itemIndex].name = name;
                inventory[itemIndex].category = category;
                inventory[itemIndex].desc = desc;
                inventory[itemIndex].qty = parseInt(qty);
                inventory[itemIndex].status = status;
            }
        } else {
            // Добавляем
            inventory.push({
                id: nextId++,
                name: name,
                category: category,
                desc: desc,
                qty: parseInt(qty),
                status: status
            });
        }

        saveDataToStorage(); // СОХРАНЯЕМ В ПАМЯТЬ БРАУЗЕРА
        
        $('#itemModal').modal('hide');
        
        // Сбрасываем фильтры, чтобы увидеть новую запись
        $('#searchInput').val('');
        $('#filterCategory').val('All');
        $('#filterStatus').val('All');
        applyFilters(); 
    });

    // 5. УДАЛЕНИЕ
    $('#inventoryTable').on('click', '.delete-btn', function() {
        if (confirm("Вы уверены, что хотите удалить эту позицию?")) {
            let idToDelete = $(this).data('id');
            inventory = inventory.filter(item => item.id !== idToDelete);
            saveDataToStorage(); // СОХРАНЯЕМ В ПАМЯТЬ БРАУЗЕРА
            applyFilters(); // Обновляем с учетом текущих фильтров
        }
    });
});