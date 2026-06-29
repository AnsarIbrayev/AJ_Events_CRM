$(document).ready(function() {
    
    // --------------------------------------------------
    // 1. ИКОНКА ТЕМЫ (Сама тема уже применена в <head>)
    // --------------------------------------------------
    let currentTheme = localStorage.getItem('crm_theme') || 'light';
    updateThemeIcon(currentTheme);

    $('#themeToggle').click(function() {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        $('html').attr('data-bs-theme', currentTheme);
        localStorage.setItem('crm_theme', currentTheme);
        updateThemeIcon(currentTheme);
    });

    function updateThemeIcon(theme) {
        if (theme === 'dark') {
            $('#themeToggle').html('<i class="fa-solid fa-sun text-warning"></i>');
        } else {
            $('#themeToggle').html('<i class="fa-solid fa-moon"></i>');
        }
    }

    // --------------------------------------------------
    // 2. БАЗА ДАННЫХ: БРОНИРОВАНИЕ ЗАЛОВ (с LocalStorage)
    // --------------------------------------------------
    let defaultVenues = [
        { date: "30 Июня 2026", venue: "Astana IT University, Assembly Hall", event: "Защита Практики", client: "Кафедра SE", status: "Подтверждено" },
        { date: "15 Июля 2026", venue: "Radisson Blu, Grand Ballroom", event: "IT Forum 2026", client: "TechCorp", status: "Оплачено" },
        { date: "22 Июля 2026", venue: "Hilton Astana, Зал А", event: "Свадьба (VIP)", client: "Частное лицо", status: "Ожидает предоплату" },
        { date: "05 Авг 2026", venue: "EXPO Congress Center", event: "Выставка TechExpo", client: "Министерство Цифровизации", status: "Подтверждено" }
    ];

    let venuesData = JSON.parse(localStorage.getItem('crm_venues_v1')) || defaultVenues;

    function saveVenues() {
        localStorage.setItem('crm_venues_v1', JSON.stringify(venuesData));
    }

    function renderVenues() {
        let tbody = $('#venuesTable');
        tbody.empty();

        venuesData.forEach((item, index) => {
            let statusBadge = '';
            if (item.status === 'Подтверждено' || item.status === 'Оплачено') {
                statusBadge = `<span class="badge bg-success shadow-sm">${item.status}</span>`;
            } else {
                statusBadge = `<span class="badge bg-warning text-dark shadow-sm">${item.status}</span>`;
            }

            let animDelay = index * 0.1;
            
            let row = `
                <tr class="animated-row" style="animation-delay: ${animDelay}s">
                    <td class="fw-bold ps-4 text-primary">${item.date}</td>
                    <td class="fw-bold"><i class="fa-solid fa-location-dot text-danger opacity-75 me-2"></i>${item.venue}</td>
                    <td>${item.event}</td>
                    <td class="text-muted">${item.client}</td>
                    <td class="pe-4">${statusBadge}</td>
                </tr>
            `;
            tbody.append(row);
        });
    }

    // Обработка кнопки "Сохранить" для Залов
    $('#saveVenueBtn').click(function() {
        let date = $('#vDate').val();
        let name = $('#vName').val();
        let event = $('#vEvent').val();
        let client = $('#vClient').val();
        let status = $('#vStatus').val();

        if (!date || !name || !event) {
            alert("Заполните дату, название и мероприятие!");
            return;
        }

        venuesData.unshift({ // unshift добавляет в начало списка
            date: date,
            venue: name,
            event: event,
            client: client,
            status: status
        });

        saveVenues();
        renderVenues();
        
        $('#venueForm')[0].reset();
        $('#venueModal').modal('hide');
    });

    // --------------------------------------------------
    // 3. БАЗА ДАННЫХ: ПОДРЯДЧИКИ (с LocalStorage)
    // --------------------------------------------------
    let defaultContractors = [
        { name: "Иван Смирнов", role: "Главный звукорежиссер", phone: "+7 (777) 123-45-67", rating: 5, icon: "fa-headphones" },
        { name: "Айгерим Касымова", role: "Декоратор-флорист", phone: "+7 (701) 987-65-43", rating: 4, icon: "fa-seedling" },
        { name: "ТОО 'LightShow Pro'", role: "Художники по свету", phone: "+7 (7172) 55-44-33", rating: 5, icon: "fa-lightbulb" },
        { name: "Данияр Омаров", role: "LED-Инженер (Экраны)", phone: "+7 (747) 111-22-33", rating: 5, icon: "fa-tv" },
        { name: "Студия 'VideoArt'", role: "Видеооператоры / Трансляция", phone: "+7 (707) 555-88-99", rating: 4, icon: "fa-video" }
    ];

    let contractorsData = JSON.parse(localStorage.getItem('crm_contractors_v1')) || defaultContractors;

    function saveContractors() {
        localStorage.setItem('crm_contractors_v1', JSON.stringify(contractorsData));
    }

    function renderContractors() {
        let grid = $('#contractorsGrid');
        grid.empty();

        contractorsData.forEach((item, index) => {
            let stars = '⭐'.repeat(item.rating);
            let animDelay = index * 0.1;

            let card = `
                <div class="col-md-6 col-lg-4 animated-row" style="animation-delay: ${animDelay}s">
                    <div class="card shadow-sm border-0 bg-body custom-rounded card-hover h-100">
                        <div class="card-body p-4 text-center">
                            <div class="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-circle mb-3" style="width: 60px; height: 60px;">
                                <i class="fa-solid ${item.icon} fs-3"></i>
                            </div>
                            <h5 class="fw-bold mb-1">${item.name}</h5>
                            <p class="text-muted small mb-3 text-uppercase fw-bold">${item.role}</p>
                            
                            <hr class="opacity-25">
                            
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="badge bg-light text-dark border"><i class="fa-solid fa-phone me-1 text-success"></i> ${item.phone}</span>
                                <span title="Рейтинг подрядчика">${stars}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            grid.append(card);
        });
    }

    // Обработка кнопки "Сохранить" для Подрядчиков
    $('#saveContractorBtn').click(function() {
        let name = $('#cName').val();
        let role = $('#cRole').val();
        let phone = $('#cPhone').val();
        let icon = $('#cIcon').val();

        if (!name || !role) {
            alert("Заполните Имя и Роль!");
            return;
        }

        contractorsData.unshift({
            name: name,
            role: role,
            phone: phone,
            rating: 5, // Новым подрядчикам по умолчанию даем 5 звезд
            icon: icon
        });

        saveContractors();
        renderContractors();
        
        $('#contractorForm')[0].reset();
        $('#contractorModal').modal('hide');
    });

    // Запускаем рендер при загрузке
    renderVenues();
    renderContractors();
});