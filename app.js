$(document).ready(function() {
    
    // 1. ИНИЦИАЛИЗАЦИЯ И LOCALSTORAGE
    // Пытаемся достать данные из памяти браузера. Если там пусто - загружаем дефолтные.
    let defaultData = [
        { id: 101, name: "Радиомикрофон Shure SM58", category: "Звук", desc: "База + 2 микрофона", qty: 12, status: "На складе" },
        { id: 102, name: "Проектор Epson EB-X41", category: "Видео", desc: "В кейсе, с пультом", qty: 3, status: "На мероприятии" },
        { id: 103, name: "Баннер Roll-up 2х0.8м", category: "Декорации", desc: "Каркас без полотна", qty: 15, status: "На складе" },
        { id: 104, name: "LED-прожектор RGB", category: "Свет", desc: "Нужна замена кабеля", qty: 8, status: "В ремонте" }
    ];

    let inventory = JSON.parse(localStorage.getItem('crm_inventory')) || defaultData;
    let nextId = parseInt(localStorage.getItem('crm_nextId')) || 105;

    // Функция сохранения данных в память браузера
    function saveDataToStorage() {
        localStorage.setItem('crm_inventory', JSON.stringify(inventory));
        localStorage.setItem('crm_nextId', nextId.toString());
    }

    // 2. ОТРИСОВКА ИНТЕРФЕЙСА
    function renderTable(data) {
        let tbody = $('#inventoryTable');
        tbody.empty();

        if(data.length === 0) {
            tbody.append('<tr><td colspan="7" class="text-center text-muted">Ничего не найдено</td></tr>');
            return;
        }

        data.forEach(function(item) {
            let statusBadge = '';
            if (item.status === 'На складе') statusBadge = '<span class="badge bg-success">На складе</span>';
            else if (item.status === 'На мероприятии') statusBadge = '<span class="badge bg-warning text-dark">На мероприятии</span>';
            else statusBadge = '<span class="badge bg-danger">В ремонте</span>';

            let description = item.desc ? item.desc : '<span class="text-muted">-</span>';

            let row = `
                <tr>
                    <td>#${item.id}</td>
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

        // Статистика всегда считается по всей базе (inventory), а не по фильтрованным данным
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