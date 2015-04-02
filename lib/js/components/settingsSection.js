var React = global.React = require('react'),
    sectionHeader,
    valueSwitch;

sectionHeader = React.createClass({
    displayName: 'SectionHeader',
    render: function () {
        'use strict';
        return React.createElement('h4', null, this.props.title);
    }
});

valueSwitch = React.createClass({
    displayName: 'ValueSwitch',
    getInitialState: function () {
        'use strict';
        return this.props.data;
    },
    onChange: function (event) {
        'use strict';
        var new_value;
        if (event.target.type === 'checkbox') {
            new_value = event.target.checked;
        } else {
            new_value = event.target.value;
        }
        tagpro.tools.settings.values[event.target.id] = new_value;
        this.setState({value: new_value});
        tagpro.tools.global.data.set('settings', tagpro.tools.settings.values);
    },
    render: function () {
        'use strict';
        var type;
        switch (typeof this.state.type) {
        case 'boolean':
            type = 'checkbox';
            break;
        case 'number':
            type = 'number';
            break;
        case 'string':
            type = 'text';
            break;
        default:
            break;
        }
        return React.createElement('div', null,
            React.createElement('label', {
                htmlFor: this.state.title
            }, this.state.description),
            React.createElement('input', {
                value: this.state.value,
                checked: this.state.value,
                id: this.state.title,
                type: type,
                onChange: this.onChange
            })
        );
    }
});

module.exports = (() => {
    'use strict';
    let tools_settings = document.createElement('div'),
        tree = tagpro.tools.settings.tree,
        menu = tagpro.tools.settings.menu,
        values = tagpro.tools.settings.values;
    function generateSettingsSection(metadata, children) {
        let new_section = document.createElement('section'),
            inputs = Object.keys(children).map(i => {
                return React.createElement(valueSwitch, {
                    data: {
                        title: i,
                        description: menu[i] ? menu[i].identity : i,
                        value: values[i],
                        type: children[i]
                    }
                });
            });
        new_section.classList.add('tools-settings-section');
        React.render(React.createElement(sectionHeader, {
            title: metadata.identity
        }), new_section);
        React.render(React.createElement('div', null, inputs), new_section);
        return new_section;
    }

    Object.keys(tree).forEach(i => {
        tools_settings.appendChild(generateSettingsSection(menu[i], tree[i]));
    });
    return tools_settings;
})();
