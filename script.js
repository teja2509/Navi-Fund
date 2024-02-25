function toggleAdditionalFields(checkbox) {
    var additionalFields = document.querySelector('.additional-fields');
    additionalFields.style.display = checkbox.checked ? 'block' : 'none';
}

function displayLocalStorageContent() {
    var localStorageContentDiv = document.getElementById('localStorageContent');
    var storedData = JSON.parse(localStorage.getItem('submittedData')) || [];

    // Reverse the order of the stored data
    storedData.reverse();

    var tableContent = `
        <table>
            <thead>
                <tr>
                    <th>Current Date</th>
                    
                    <th>Midcap 150</th>
                    <th>Next 50</th>
                    <th>NASDAQ 100</th>
                    <th>US Stock</th>
                    <th>Total</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
    `;

    for (var i = 0; i < storedData.length; i++) {
        var data = storedData[i];
        var totalSum = parseFloat(data.midcap150) + parseFloat(data.next50) + parseFloat(data.nasdaq100) + parseFloat(data.usStock);

        // Get the previous day's data
        var previousData = storedData[i + 1];

        // Compare the total value of the current day with the previous day
        var bgColor = '';
        if (!data.investedToday && previousData) {
            var previousTotalSum = parseFloat(previousData.midcap150) + parseFloat(previousData.next50) + parseFloat(previousData.nasdaq100) + parseFloat(previousData.usStock);
            if (totalSum > previousTotalSum) {
                bgColor = 'lightgreen';
            } else if (totalSum < previousTotalSum) {
                bgColor = '#FF474C';
            }
        }

        tableContent += `
            <tr>
                <td class="${data.investedToday ? 'invested-today' : ''}">${data.date}</td>
                
                <td>${data.midcap150}</td>
                <td>${data.next50}</td>
                <td>${data.nasdaq100}</td>
                <td>${data.usStock}</td>
                
                <td style="background-color: ${bgColor};">${totalSum}</td>
                <td><button onclick="removeLocalStorageEntry(${storedData.length - i - 1})">&#10006;</button></td>
            </tr>
        `;
    }

    storedData.reverse();

    tableContent += `
            </tbody>
        </table>
    `;

    localStorageContentDiv.innerHTML = tableContent;
}

displayLocalStorageContent();





function updateInvestmentDetails() {
    var storedData = JSON.parse(localStorage.getItem('submittedData')) || [];
    var investedValue = 0;
    var currentValue = 0;
    var returnValue = 0;
    var investedDaysCount = 0;
    var profitDaysCount = 0;
    var lossDaysCount = 0;
    var investedMoneyList = document.getElementById('investedMoneyList');
    var investmentDetailsDiv = document.getElementById('investmentDetails');

    investedMoneyList.innerHTML = ''; // Clear the list

    // Reverse the order of the stored data
    storedData.reverse();

    for (var i = 0; i < storedData.length; i++) {
        var data = storedData[i];
        var totalSum = parseFloat(data.midcap150) + parseFloat(data.next50) + parseFloat(data.nasdaq100) + parseFloat(data.usStock);

        if (data.investedToday) {
            investedDaysCount++;
            investedValue += parseFloat(data.amountInvested);

            // Add the investment to the table
            var row = document.createElement('tr');
            var dateCell = document.createElement('td');
            dateCell.textContent = data.date;
            row.appendChild(dateCell);
            var investedMoneyCell = document.createElement('td');
            investedMoneyCell.textContent = data.amountInvested;
            row.appendChild(investedMoneyCell);
            investedMoneyList.appendChild(row);

            // Display the values of the additional fields in the table if they are not empty
            if (data.midcap150Invested.trim() !== '') {
                var midcap150InvestedCell = document.createElement('td');
                midcap150InvestedCell.textContent = data.midcap150Invested;
                row.appendChild(midcap150InvestedCell);
            }

            if (data.next50Invested.trim() !== '') {
                var next50InvestedCell = document.createElement('td');
                next50InvestedCell.textContent = data.next50Invested;
                row.appendChild(next50InvestedCell);
            }

            if (data.nasdaq100Invested.trim() !== '') {
                var nasdaq100InvestedCell = document.createElement('td');
                nasdaq100InvestedCell.textContent = data.nasdaq100Invested;
                row.appendChild(nasdaq100InvestedCell);
            }

            if (data.usStockInvested.trim() !== '') {
                var usStockInvestedCell = document.createElement('td');
                usStockInvestedCell.textContent = data.usStockInvested;
                row.appendChild(usStockInvestedCell);
            }

            investedMoneyList.appendChild(row);
        }

        if (i > 0) {
            var previousTotalSum = parseFloat(storedData[i - 1].midcap150) + parseFloat(storedData[i - 1].next50) + parseFloat(storedData[i - 1].nasdaq100) + parseFloat(storedData[i - 1].usStock);
            if (totalSum > previousTotalSum) {
                lossDaysCount++;
            } else if (totalSum < previousTotalSum) {
                
                profitDaysCount++;
            }
        }

        // Check if this is the most recent entry
        if (i === 0) {
            // Update the current value with the total sum of the most recent entry
            currentValue = totalSum;
        }
    }

    returnValue = currentValue - investedValue;

    document.getElementById('investedValue').innerText = 'Invested : ' + investedValue.toFixed(2);
    document.getElementById('currentValue').innerText = 'Current : ' + currentValue.toFixed(2);
    document.getElementById('returnValue').innerText = 'Returns : ' + returnValue.toFixed(2);
    document.getElementById('investedDaysCount').innerText = investedDaysCount;
    document.getElementById('profitDaysCount').innerText = profitDaysCount-investedDaysCount+1;
    document.getElementById('lossDaysCount').innerText = lossDaysCount;

    // Set the background color based on the relationship between Current Value and Invested Value
    if (currentValue > investedValue) {
        investmentDetailsDiv.style.backgroundColor = 'lightgreen';
    } else if (currentValue < investedValue) {
        investmentDetailsDiv.style.backgroundColor = '#FF474C';
    } else {
        investmentDetailsDiv.style.backgroundColor = 'white';
    }
}



function formatDate(date) {
    var parts = date.split('-');
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

function formatAutomaticDate(date) {
    var formattedDate = new Date(date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    var parts = formattedDate.split('/');
    return `${parts[0]}-${parts[1]}-${parts[2]}`;
}

document.getElementById("stockForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent the form from submitting normally

    var investedToday = document.getElementById("investedToday").checked;
    var amountInvested = document.getElementById("amountInvested").value;
    var midcap150Invested = document.getElementById("midcap150Invested").value;
    var next50Invested = document.getElementById("next50Invested").value;
    var nasdaq100Invested = document.getElementById("nasdaq100Invested").value;
    var usStockInvested = document.getElementById("usStockInvested").value;
    var midcap150 = document.getElementById("midcap150").value;
    var next50 = document.getElementById("next50").value;
    var nasdaq100 = document.getElementById("nasdaq100").value;
    var usStock = document.getElementById("usStock").value;
    var date = document.getElementById("date").value;

    // Format the date in "DD-MM-YYYY" format
    var formattedDate = date ? formatDate(date) : formatAutomaticDate(new Date());

    // Store the form data in local storage
    var newData = {
        investedToday: investedToday,
        amountInvested: amountInvested,
        midcap150Invested : midcap150Invested,
        next50Invested : next50Invested,
        nasdaq100Invested:nasdaq100Invested,
        usStockInvested:usStockInvested,
        midcap150: midcap150,
        next50: next50,
        nasdaq100: nasdaq100,
        usStock: usStock,
        date: formattedDate
    };

    var storedData = JSON.parse(localStorage.getItem('submittedData')) || [];
    storedData.push(newData);
    localStorage.setItem('submittedData', JSON.stringify(storedData));

    // Clear the form after submission
    document.getElementById("stockForm").reset();

    // Display the stored data
    displayLocalStorageContent();
    updateInvestmentDetails();
});






// Display the stored data when the page loads
displayLocalStorageContent();
updateInvestmentDetails();

function removeLocalStorageEntry(index) {
    var storedData = JSON.parse(localStorage.getItem('submittedData')) || [];
    var deleteConfirmed = confirm("Are you sure you want to delete this entry?");
    if (deleteConfirmed) {
        storedData.splice(index, 1);
        localStorage.setItem('submittedData', JSON.stringify(storedData));
        displayLocalStorageContent();
        updateInvestmentDetails();
    }
}



function displayContentAfterDelay() {
    // Show the content after 15 seconds
    setTimeout(function() {
        document.getElementById('localStorageContent').style.visibility = 'visible';
        document.getElementById('investedMoney').style.visibility = 'visible';
        document.getElementById('investmentDetails').style.visibility = 'visible';
        document.getElementById('investmentDays').style.visibility = 'visible';
    }, 1000); // 15 seconds in milliseconds
}

// Call the function when the page loads
window.onload = function() {
    displayContentAfterDelay();
};

function reloadPage() {
    location.reload();
}
