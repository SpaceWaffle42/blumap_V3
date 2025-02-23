document.addEventListener('DOMContentLoaded', function () {
    const subnetContainer = document.getElementById("subnets-container");
    subnetContainer.innerHTML = '';

    function populateSubnets() {
        fetch('/data')
            .then(response => response.json())
            .then(data => {
                if (!Array.isArray(data)) {
                    console.error('Data is not an array', data);
                    return;
                }

                const groupedSubnets = {};
                data.forEach(item => {
                    const ip = Object.keys(item)[0];
                    const subnet = ip.split('.').slice(0, 3).join('.') + '.x';

                    if (!groupedSubnets[subnet]) {
                        groupedSubnets[subnet] = [];
                    }
                    groupedSubnets[subnet].push(ip);
                });

                subnetContainer.innerHTML = ''; // Clear previous content

                Object.keys(groupedSubnets).sort().forEach(subnet => {
                    let subnetDiv = document.createElement('div');
                    subnetDiv.classList.add('subnet-group', 'white-text');

                    // **Collapsible Header**
                    let subnetHeader = document.createElement('div');
                    subnetHeader.classList.add('subnet-header', 'card-title');
                    subnetHeader.innerHTML = `<strong>Subnet ${subnet}</strong>`;

                    // Click event to expand only one section at a time
                    subnetHeader.addEventListener('click', function () {
                        // Close all open sections
                        document.querySelectorAll('.ip-list').forEach(list => {
                            if (list !== ipList) list.style.display = 'none';
                        });

                        // Toggle only the clicked section
                        ipList.style.display = ipList.style.display === 'none' ? 'inline-block' : 'none';
                    });

                    subnetDiv.appendChild(subnetHeader);

                    // **Materialize Select-All Checkbox**
                    let selectAllContainer = document.createElement('p');
                    selectAllContainer.classList.add('select-all-container');

                    let selectAllCheckbox = document.createElement('input');
                    selectAllCheckbox.type = 'checkbox';
                    selectAllCheckbox.classList.add('select-all-option', 'filled-in');
                    selectAllCheckbox.dataset.subnet = subnet;
                    selectAllCheckbox.id = `select-all-${subnet}`;

                    let selectAllLabel = document.createElement('label');
                    selectAllLabel.setAttribute('for', `select-all-${subnet}`);
                    selectAllLabel.textContent = ` Select All`;

                    selectAllContainer.appendChild(selectAllCheckbox);
                    selectAllContainer.appendChild(selectAllLabel);
                    subnetDiv.appendChild(selectAllContainer);

                    // **IP List**
                    let ipList = document.createElement('div');
                    ipList.classList.add('ip-list');
                    ipList.style.display = 'none';

                    groupedSubnets[subnet].sort().forEach(ip => {
                        let optionContainer = document.createElement('p');
                        optionContainer.classList.add('subnet-option-container');

                        let optionCheckbox = document.createElement('input');
                        optionCheckbox.type = 'checkbox';
                        optionCheckbox.classList.add('subnet-option', 'filled-in');
                        optionCheckbox.value = ip;
                        optionCheckbox.id = `subnet-${ip}`;

                        let optionLabel = document.createElement('span');
                        optionLabel.textContent = ` ${ip}`;

                        let labelContainer = document.createElement('label');
                        labelContainer.setAttribute('for', `subnet-${ip}`);
                        labelContainer.appendChild(optionCheckbox);
                        labelContainer.appendChild(optionLabel);

                        optionContainer.appendChild(labelContainer);
                        ipList.appendChild(optionContainer);
                    });

                    subnetDiv.appendChild(ipList);
                    subnetContainer.appendChild(subnetDiv);
                });

                // **Initialize Materialize Styles**
                M.updateTextFields();
                enableSelectAllFeature();
                enableSubnetSelection();
            })
            .catch(error => console.error('Error fetching subnet data:', error));
    }

    // **Enable "Select All" Feature**
    function enableSelectAllFeature() {
        document.querySelectorAll('.select-all-option').forEach(selectAllCheckbox => {
            selectAllCheckbox.addEventListener('change', function () {
                let subnet = this.dataset.subnet;
                let subnetGroup = this.closest('.subnet-group');
                let ipList = subnetGroup.querySelectorAll('.subnet-option');

                ipList.forEach(opt => {
                    opt.checked = this.checked;
                });

                // **Dispatch subnetChange event**
                document.dispatchEvent(new CustomEvent("subnetChange"));
            });
        });
    }

    // **Enable Individual Subnet Selection**
    function enableSubnetSelection() {
        document.querySelectorAll('.subnet-option').forEach(subnetCheckbox => {
            subnetCheckbox.addEventListener('change', function () {
                let subnetGroup = this.closest('.subnet-group');
                let selectAllCheckbox = subnetGroup.querySelector('.select-all-option');
                let allOptions = subnetGroup.querySelectorAll('.subnet-option');
                let allChecked = Array.from(allOptions).every(opt => opt.checked);
                selectAllCheckbox.checked = allChecked;

                // **Dispatch subnetChange event when an IP is selected/deselected**
                document.dispatchEvent(new CustomEvent("subnetChange"));
            });
        });
    }

    // **Get Selected IPs**
    function getSelectedSubnets() {
        let selectedIPs = [];
        document.querySelectorAll('.subnet-option:checked').forEach(checkbox => {
            selectedIPs.push(checkbox.value);
        });

        return selectedIPs.length > 0 ? selectedIPs : "all";
    }

    window.getSelectedSubnets = getSelectedSubnets;

    // **Populate Subnets on Load**
    populateSubnets();
    document.addEventListener('dataChange', populateSubnets);
});
