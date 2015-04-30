class Menu {
    constructor() {
        this.menu_items = {};
        this.openMenuSection = (name) => {
            if (document.getElementById(name)) {
                for (let i = 0; i < document.getElementsByClassName('tools-menu-section').length; i++) {
                    document.getElementsByClassName('tools-menu-section')[i].style.display = 'none';
                }
                document.getElementById(name).style.display = 'flex';
            }
        };
    }
    open() {
        let self = this;
        function createButton(button_name) {
            let new_button = document.createElement('button');
            new_button.textContent = button_name;
            new_button.classList.add('button');
            new_button.classList.add('small');
            new_button.addEventListener('click', (event) => {
                self.openMenuSection(event.target.textContent);
            });
            return new_button;
        }
        let tools_settings = document.createElement('div'),
            tools_button_area = document.createElement('div');
        tools_settings.classList.add('tools-settings');
        tools_settings.id = 'tools-settings';
        tools_button_area.id = 'tools-menu-buttons';
        tools_settings.appendChild(tools_button_area);
        Object.keys(self.menu_items).forEach(i => {
            if (!self.menu_items[i].classList.contains('tools-menu-section')) {
                self.menu_items[i].classList.add('tools-menu-section');
            }
            tools_button_area.appendChild(createButton(i));
            tools_settings.appendChild(self.menu_items[i]);
        });
        document.body.appendChild(tools_settings);
        self.openMenuSection('Settings');
    }
    setSection(section_name, section_html) {
        try {
            section_html.id = section_name;
        } catch (e) {
            return;
        }
        this.menu_items[section_name] = section_html;
    }
}

module.exports = new Menu();
