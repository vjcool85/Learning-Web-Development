
// :::writing{variant="document" id="61483"}
const ticketIdInput = document.getElementById("ticketId");
const createdTime = document.getElementById("createdTime");
const closedTime = document.getElementById("closedTime");
const slaHours = document.getElementById("slaHours");
const calculateBtn = document.getElementById("calculateBtn");
const resetBtn = document.getElementById("resetBtn");
const exportBtn = document.getElementById("exportBtn");
const exportScope = document.getElementById("exportScope");
const exportFormat = document.getElementById("exportFormat");
const includeTimestamp = document.getElementById("includeTimestamp");
const result = document.getElementById("result");
const ticketList = document.getElementById("ticketList");
const totalTickets = document.getElementById("totalTickets");
const normalTickets = document.getElementById("normalTickets");
const approachingTickets = document.getElementById("approachingTickets");
const breachedTickets = document.getElementById("breachedTickets");
const searchTicket = document.getElementById("searchTicket");
const statusFilter = document.getElementById("statusFilter");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const createdFromInput = document.getElementById("createdFrom");
const createdToInput = document.getElementById("createdTo");
// const clearDateFilterBtn = document.getElementById("clearDateFilter");





let tickets = [];
const STORAGE_KEY = "ticketSLAData";
let editingTicketId = null;
let sortColumn = null;
let sortDirection = "asc";

let currentPage = 1;
const ticketsPerPage = 10;

function renderTickets() {
    if (tickets.length === 0) {
        ticketList.innerHTML = "<p>No tickets added yet.</p>";
        return;
    }

    // // ticketList.innerHTML =  tickets.map(ticket => {
    //    ticketList.innerHTML = ` <table class= "ticket-table">
    //         <thead?
    //             <tr>
                    
    const filteredTickets = getFilteredTickets();
    const sortedTickets = getSortedTickets(filteredTickets);


    const totalPages = Math.ceil(
    sortedTickets.length / ticketsPerPage
    );

    if (currentPage > totalPages && totalPages > 0) {
        currentPage = totalPages;
    }

    const startIndex =
        (currentPage - 1) * ticketsPerPage;

    const endIndex =
        startIndex + ticketsPerPage;

    const paginatedTickets =
        sortedTickets.slice(startIndex, endIndex);

    if (filteredTickets.length === 0) {
        ticketList.innerHTML = "<p>No tickets match the search criteria.</p>";
        return;
    }

    ticketList.innerHTML = `
        <table class="ticket-table">

            <thead>
                <tr>
                    <th data-sort="ticketId">
                        Ticket ID ${getSortArrow("ticketId")}
                    </th>
                    <th data-sort="resolutionTime">
                        Resolution Time ${getSortArrow("resolutionTime")}
                    </th>
                    <th data-sort="slaAllowed">
                        SLA Allowed ${getSortArrow("slaAllowed")}
                    </th>
                    <th data-sort="slaUsed">
                        SLA Used ${getSortArrow("slaUsed")}</th>
                    <th data-sort="status">
                        Status ${getSortArrow("status")}
                    </th>
                    <th data-sort="time">
                        Remaining Time ${getSortArrow("time")}
                    </th>
                    <th>
                        Actions
                    </th>
                </tr>
            </thead>
            <tbody>

                ${paginatedTickets.map(ticket => {
                    const slaResult = calculateSLA(ticket);
                    return `
                        <tr>
                            <td>${ticket.ticketId}</td>

                            <td>
                                ${formatDuration(slaResult.difference)}
                            </td>

                            <td>
                                ${formatDuration(slaResult.slaMilliseconds)}
                            </td>

                            <td>
                                ${slaResult.percentage}%
                            </td>

                            <td>
                                <span class="sla-status ${slaResult.statusClass}">
                                    ${slaResult.status}
                                </span>
                            </td>

                            <td>
                                ${slaResult.timeMessage.value}
                            </td>

                            <td>
                                <button
                                    class="edit-btn"
                                    data-id="${ticket.ticketId}">
                                    Edit
                                </button>

                                <button
                                    class="delete-btn"
                                    data-id="${ticket.ticketId}">
                                    Delete
                                </button>

                            </td>

                        </tr>
                    `;

                }).join("")}

            </tbody>

        </table>
    `;

    renderPagination(sortedTickets.length);
}

function renderPagination(totalTickets) {

    const pagination = document.getElementById("pagination");

    const totalPages =
        Math.ceil(totalTickets / ticketsPerPage);

    if (totalPages <= 1) {
        pagination.innerHTML = "";
        return;
    }

    pagination.innerHTML = `
        <button id="previousPage"
            ${currentPage === 1 ? "disabled" : ""}>
            Previous
        </button>

        <span>
            Page ${currentPage} of ${totalPages}
        </span>

        <button id="nextPage"
            ${currentPage === totalPages ? "disabled" : ""}>
            Next
        </button>
    `;

    document
        .getElementById("previousPage")
        .addEventListener("click", function () {

            if (currentPage > 1) {
                currentPage--;
                renderTickets();
            }

        });

    document
        .getElementById("nextPage")
        .addEventListener("click", function () {

            if (currentPage < totalPages) {
                currentPage++;
                renderTickets();
            }

        });
}

// function renderTickets() {
//     if (tickets.length === 0) {
//         ticketList.innerHTML = "<p>No tickets added yet.</p>";
//         return;
//     }

//     ticketList.innerHTML = tickets.map(ticket => {
//         const slaResult = calculateSLA(ticket);
//         return `
//             <div class="ticket-card">
//                 <h3>${ticket.ticketId}</h3>

//                 <p>
//                     <strong>Resolution Time:</strong>
//                     ${formatDuration(slaResult.difference)}
//                 </p>

//                 <p>
//                     <strong>SLA Allowed:</strong>
//                     ${formatDuration(slaResult.slaMilliseconds)}
//                 </p>

//                 <p>
//                     <strong>SLA Used:</strong>
//                     ${slaResult.percentage}%
//                 </p>

//                 <div class="progress-container">
//                     <div
//                         class="progress-bar ${slaResult.statusClass}"
//                         style="width: ${slaResult.progressWidth}%">
//                     </div>
//                 </div>

//                 <div class="sla-status ${slaResult.statusClass}">
//                     <strong>${slaResult.status}</strong>
//                 </div>

//             </div>
//         `;

//     }).join("");
// }


// function formatDuration(milliseconds) {

// const totalSeconds = Math.floor(milliseconds / 1000);
// const hours = Math.floor(totalSeconds / 3600);
// const minutes = Math.floor(
//     (totalSeconds % 3600) / 60
// );

// const seconds = totalSeconds % 60;

// if (hours > 0) {return `${hours}h ${minutes}m`;}
// if (minutes > 0) {return `${minutes}m ${seconds}s`;}
// return `${seconds}s`;

// }

function formatDuration(milliseconds) {
    let totalSeconds = Math.floor(milliseconds / 1000);

    const hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, "0")}h ` +
           `${String(minutes).padStart(2, "0")}m ` +
           `${String(seconds).padStart(2, "0")}s`;
}



function showErrors(errors) {
    result.innerHTML = `
        <div class="error-message">
            <h2>⚠ Please check your input</h2>
            <ul>
                ${errors.map(error => `<li>${error}</li>`).join("")}
            </ul>
        </div>
    `;
}


function getValidatedInput() {

    const errors = [];

    const ticketIdValue = ticketIdInput.value.trim();
    const createdValue = createdTime.value;
    const closedValue = closedTime.value;
    const slaInput = slaHours.value.trim();


    // Required field validation

    if (!ticketIdValue) {
        errors.push("Ticket ID is required.");
    }

    if (!createdValue) {
        errors.push("Created date and time is required.");
    }

    if (!closedValue) {
        errors.push("Closed date and time is required.");
    }

    if (!slaInput) {
        errors.push("SLA hours is required.");
    }


    // Stop if required fields are missing

    if (errors.length > 0) {
        showErrors(errors);
        return null;
    }


    // SLA validation

    const sla = Number(slaInput);

    if (Number.isNaN(sla) || sla <= 0) {
        result.innerHTML = `
            <div class="error-message">
                <p>SLA must be a valid number greater than 0.</p>
            </div>
        `;

        return null;
    }


    // Convert date values

    const created = new Date(createdValue);
    const closed = new Date(closedValue);


    // Date validation

    if (Number.isNaN(created.getTime())) {
        result.innerHTML = `
            <div class="error-message">
                <p>Created date/time is invalid.</p>
            </div>
        `;

        return null;
    }

    if (Number.isNaN(closed.getTime())) {
        result.innerHTML = `
            <div class="error-message">
                <p>Closed date/time is invalid.</p>
            </div>
        `;

        return null;
    }


    // Check date order

    if (closed < created) {

        // console.log("Date ORDER ERROR");

        showErrors([
            "Closed time cannot be earlier than Created time."
        ]);
      
        return null;
    }

    // if (closed < created) {
    //     result.innerHTML = `
    //         <div class="error-message">
    //             <p>Closed time cannot be earlier than Created time.</p>
    //         </div>
    //     `;

    //     return null;
    // }


    // Return validated ticket data

    return {
        ticketId: ticketIdValue,
        created,
        closed,
        sla
    };
}


function determineStatus(slaPercentage) {

    if (slaPercentage > 100) {
        return {
            status: "SLA BREACHED",
            statusClass: "breached"
        };
    }

    if (slaPercentage >= 75) {
        return {
            status: "APPROACHING SLA",
            statusClass: "approaching"
        };
    }

    return {
        status: "NORMAL",
        statusClass: "normal"
    };
}

function calculateSLA(ticket) {

    // Resolution time
    const difference = ticket.closed - ticket.created;


    // Convert SLA hours to milliseconds
    const slaMilliseconds =
        ticket.sla * 60 * 60 * 1000;

    // Calculate SLA percentage
    const slaPercentage =
        (difference / slaMilliseconds) * 100;

    const percentage =
        slaPercentage.toFixed(1);

    // Progress bar cannot exceed 100%
    const progressWidth =
        Math.min(slaPercentage, 100);

    // Determine status
    const statusInfo =
        determineStatus(slaPercentage);

    // Calculate remaining or exceeded time
    let timeMessage;

    if (difference <= slaMilliseconds) {
        const remaining =
            slaMilliseconds - difference;

        timeMessage = {
            // label: "Remaining Time",
            value: formatDuration(remaining)
        };

    } else {

        const exceeded =
            difference - slaMilliseconds;

        timeMessage = {
            // label: "Exceeded By",
            value: formatDuration(exceeded)
        };
    }


    // Return all calculated results

    return {
        difference,
        slaMilliseconds,
        percentage,
        progressWidth,
        status: statusInfo.status,
        statusClass: statusInfo.statusClass,
        timeMessage
    };
}


function renderResult(ticket, slaResult) {

    result.innerHTML = `
        <div class="sla-status ${slaResult.statusClass}">
            <h2>${slaResult.status}</h2>
        </div>

        <p>
            <strong>Ticket ID:</strong>
            ${ticket.ticketId}
        </p>

        <p>
            <strong>Resolution Time:</strong>
            ${formatDuration(slaResult.difference)}
        </p>

        <p>
            <strong>SLA Allowed:</strong>
            ${formatDuration(slaResult.slaMilliseconds)}
        </p>

        <p>
            <strong>SLA Used:</strong>
            ${slaResult.percentage}%
        </p>

        <div class="progress-container">
            <div
                class="progress-bar ${slaResult.statusClass}"
                style="width: ${slaResult.progressWidth}%">
            </div>
        </div>

        <p>
            ${slaResult.timeMessage.value}
        </p>
    `;
}

calculateBtn.addEventListener("click", function () {

const ticket = getValidatedInput();
// console.log("Validation result:", ticket);

if (!ticket) {
    return;
}

// EDIT MODE
if (editingTicketId !== null) {

    const index = tickets.findIndex(ticket => {
        return ticket.ticketId === editingTicketId;
    });

    if (index !== -1) {
        tickets[index] = ticket;
    }

    editingTicketId = null;

    calculateBtn.textContent = "Calculate";

    result.innerHTML = `
        <p>
            Ticket <strong>${ticket.ticketId}</strong>
            updated successfully.
        </p>
    `;

}

// CREATE MODE
else {

    tickets.push(ticket);

    result.innerHTML = `
        <p>
            Ticket <strong>${ticket.ticketId}</strong>
            added successfully.
        </p>
    `;
}

// Calculate SLA result
const slaResult = calculateSLA(ticket);

// Show full SLA result on Calculator page
renderResult(ticket, slaResult);

saveTickets();
renderTickets();
updateDashboard();

});




// calculateBtn.addEventListener("click", function () {

//     const ticket = getValidatedInput();

//     if (!ticket) {
//         return;
//     }

//     // EDIT MODE
//     if (editingTicketId !== null) {

//         const index = tickets.findIndex(ticket => {
//             return ticket.ticketId === editingTicketId;
//         });

//         if (index !== -1) {

//             tickets[index] = ticket;
//             saveTickets();
//         }

//         editingTicketId = null;

//         calculateBtn.textContent = "Calculate";

//         result.innerHTML = `
//             <p>
//                 Ticket <strong>${ticket.ticketId}</strong>
//                 updated successfully.
//             </p>
//         `;

//     }

//     // CREATE MODE
//     else {

//         tickets.push(ticket);

//         result.innerHTML = `
//             <p>
//                 Ticket <strong>${ticket.ticketId}</strong>
//                 added successfully.
//             </p>
//         `;
//     }

//     saveTickets();
//     renderTickets();
//     updateDashboard();
    
//         // const slaResult = calculateSLA(ticket);
//         // renderResult(ticket, slaResult);
// });


resetBtn.addEventListener("click", function () {

    ticketIdInput.value = "";
    createdTime.value = "";
    closedTime.value = "";
    slaHours.value = "";

    tickets = [];

    localStorage.removeItem(STORAGE_KEY);

    result.innerHTML = "";
    renderTickets();
    updateDashboard();

});


function updateDashboard() {

    let normal = 0;
    let approaching = 0;
    let breached = 0;

    tickets.forEach(ticket => {

        const slaResult = calculateSLA(ticket);

        if (slaResult.statusClass === "normal") {
            normal++;
        }

        else if (slaResult.statusClass === "approaching") {
            approaching++;
        }

        else if (slaResult.statusClass === "breached") {
            breached++;
        }
    });

    totalTickets.textContent = tickets.length;
    normalTickets.textContent = normal;
    approachingTickets.textContent = approaching;
    breachedTickets.textContent = breached;
}


function getFilteredTickets() {

    const searchText = searchTicket.value
        .trim()
        .toLowerCase();

    const selectedStatus = statusFilter.value;

    // ADD THESE TWO
    const createdFrom = createdFromInput.value;
    const createdTo = createdToInput.value;

    return tickets.filter(ticket => {

        const matchesSearch =
            ticket.ticketId
                .toLowerCase()
                .includes(searchText);

        const slaResult = calculateSLA(ticket);

        const matchesStatus =
            selectedStatus === "all" ||
            slaResult.statusClass === selectedStatus;

        // ADD FROM DATE CHECK
        let matchesFromDate = true;

        if (createdFrom) {

            const fromDate =
                new Date(createdFrom + "T00:00:00");

            matchesFromDate =
                ticket.created >= fromDate;
        }

        // ADD TO DATE CHECK
        let matchesToDate = true;

        if (createdTo) {

            const toDate =
                new Date(createdTo + "T23:59:59.999");

            matchesToDate =
                ticket.created <= toDate;
        }

        // MODIFY ONLY THIS RETURN
        return (
            matchesSearch &&
            matchesStatus &&
            matchesFromDate &&
            matchesToDate
        );

    });
}


// function getFilteredTickets() {

//     const searchText = searchInput.value.trim().toLowerCase();

//     const createdFrom = createdFromInput.value;
//     const createdTo = createdToInput.value;

//     return tickets.filter(ticket => {

//         // Existing search filter
//         const matchesSearch =
//             ticket.ticketId.toLowerCase().includes(searchText);

//         // Created From filter
//         let matchesFromDate = true;

//         if (createdFrom) {
//             const fromDate = new Date(createdFrom + "T00:00:00");

//             matchesFromDate = ticket.created >= fromDate;
//         }

//         // Created To filter
//         let matchesToDate = true;

//         if (createdTo) {
//             const toDate = new Date(createdTo + "T23:59:59");

//             matchesToDate = ticket.created <= toDate;
//         }

//         return (
//             matchesSearch &&
//             matchesFromDate &&
//             matchesToDate
//         );
//     });
// }


// clearDateFilterBtn.addEventListener("click", function () {

//     createdFromInput.value = "";
//     createdToInput.value = "";

//     renderTickets();
// });

function getSortedTickets(ticketArray) {

    if (!sortColumn) {
        return ticketArray;
    }

    return [...ticketArray].sort((a, b) => {

        const slaA = calculateSLA(a);
        const slaB = calculateSLA(b);

        let valueA;
        let valueB;

        switch (sortColumn) {

            case "ticketId":
                valueA = a.ticketId.toLowerCase();
                valueB = b.ticketId.toLowerCase();
                break;

            case "resolutionTime":
                valueA = slaA.difference;
                valueB = slaB.difference;
                break;

            case "slaAllowed":
                valueA = slaA.slaMilliseconds;
                valueB = slaB.slaMilliseconds;
                break;

            case "slaUsed":
                valueA = Number(slaA.percentage);
                valueB = Number(slaB.percentage);
                break;

            case "status":
                valueA = slaA.status;
                valueB = slaB.status;
                break;

            case "time":

                // Use actual remaining/exceeded time
                if (slaA.difference <= slaA.slaMilliseconds) {
                    valueA = slaA.slaMilliseconds - slaA.difference;
                } else {
                    valueA = slaA.difference - slaA.slaMilliseconds;
                }

                if (slaB.difference <= slaB.slaMilliseconds) {
                    valueB = slaB.slaMilliseconds - slaB.difference;
                } else {
                    valueB = slaB.difference - slaB.slaMilliseconds;
                }

                break;

            default:
                return 0;
        }

        let comparison;

        if (typeof valueA === "string") {
            comparison = valueA.localeCompare(valueB);
        } else {
            comparison = valueA - valueB;
        }

        return sortDirection === "asc"
            ? comparison
            : -comparison;
    });
}

searchTicket.addEventListener("input", function () {
    currentPage = 1; // Reset to first page on new search
    renderTickets();
});

statusFilter.addEventListener("change", function () {
    currentPage = 1; // Reset to first page on filter change
    renderTickets();
});

createdFromInput.addEventListener("change", function () {
    currentPage = 1; // Reset to first page on date change
    renderTickets();
});

createdToInput.addEventListener("change", function () {
    currentPage = 1; // Reset to first page on date change
    renderTickets();
});



function editTicket(ticketId) {

    const ticket = tickets.find(ticket => ticket.ticketId === ticketId);

    if (!ticket) return;

    // Go to Calculator page
    showPage("calculator");

    // Enter edit mode
    editingTicketId = ticketId;

    // Populate form
    ticketIdInput.value = ticket.ticketId;
    createdTime.value = formatDateTime(ticket.created);
    closedTime.value = formatDateTime(ticket.closed);
    slaHours.value = ticket.sla;

    // Change button text
    calculateBtn.textContent = "Update Ticket";

    // Scroll to form
    ticketIdInput.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

    ticketIdInput.focus();
}

function formatDateTime(date) {

    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    const hours = String(date.getHours()).padStart(2, "0");

    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function deleteTicket(ticketId) {
    tickets = tickets.filter(ticket => {
        return ticket.ticketId !== ticketId;
    });

    saveTickets();
    renderTickets();
    updateDashboard();
}


ticketList.addEventListener("click", function (event) {

// =========================
// SORT TABLE
// =========================

const sortHeader = event.target.closest("th[data-sort]");

if (sortHeader) {

    const column = sortHeader.dataset.sort;

    if (sortColumn === column) {

        // Same column → reverse direction
        sortDirection =
            sortDirection === "asc" ? "desc" : "asc";

    } else {

        // New column → start ascending
        sortColumn = column;
        sortDirection = "asc";
    }

    renderTickets();

    return;
}


// =========================
// EDIT / DELETE
// =========================

const button = event.target.closest("button[data-id]");

if (!button) {
    return;
}

const ticketId = button.dataset.id;

if (button.classList.contains("delete-btn")) {

    deleteTicket(ticketId);

    return;
}

if (button.classList.contains("edit-btn")) {

    editTicket(ticketId);

    return;
}

});

cancelEditBtn.addEventListener("click", function () {

    editingTicketId = null;

    ticketIdInput.value = "";
    createdTime.value = "";
    closedTime.value = "";
    slaHours.value = "";

    calculateBtn.textContent = "Calculate";

    result.innerHTML = "";
});


function getSortArrow(column) {

    if (sortColumn !== column) {
        return "↕";
    }

    return sortDirection === "asc"
        ? "↑"
        : "↓";
}

function saveTickets() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(tickets)
    );

}

function loadTickets() {

    const savedTickets =
        localStorage.getItem(STORAGE_KEY);

    if (savedTickets) {

        tickets = JSON.parse(savedTickets).map(ticket => { 
            return { 
                ...ticket, 
                created: new Date(ticket.created), 
                closed: new Date(ticket.closed) 
            }; 
        }); 
    }
}

exportBtn.addEventListener("click", function () {

    if (exportFormat.value === "csv") {
        exportCSV();
    }

    else if (exportFormat.value === "xlsx") {
        exportExcel();
    }

    else if (exportFormat.value === "pdf") {
        exportPDF();
    }

});

function exportCSV() {

    const ticketsToExport = getTicketsForExport();

    if (ticketsToExport.length === 0) {

        result.innerHTML = `
            <div class="error-message">
                <p>No tickets available to export.</p>
            </div>
        `;

        return;
    }

    const headers = [
        "Ticket ID",
        "Created",
        "Closed",
        "Resolution Time",
        "SLA Allowed",
        "SLA Used",
        "Status",
        "Remaining/Exceeded"
    ];

    const rows = ticketsToExport.map(ticket => {

        const slaResult = calculateSLA(ticket);

        return [
            ticket.ticketId,
            formatCSVDateTime(ticket.created),
            formatCSVDateTime(ticket.closed),
            formatDuration(slaResult.difference),
            formatDuration(slaResult.slaMilliseconds),
            `${slaResult.percentage}%`,
            slaResult.status,
            // `${slaResult.timeMessage.label}: ${slaResult.timeMessage.value}`
            slaResult.timeMessage.value
        ];

    });

    const timestamp = new Date();

    const exportTimestamp =
        `${timestamp.getFullYear()}-${String(
            timestamp.getMonth() + 1
        ).padStart(2, "0")}-${String(
            timestamp.getDate()
        ).padStart(2, "0")} ${String(
            timestamp.getHours()
        ).padStart(2, "0")}:${String(
            timestamp.getMinutes()
        ).padStart(2, "0")}:${String(
            timestamp.getSeconds()
        ).padStart(2, "0")}`;

    // Build CSV
    let csvRows = [];

    if (includeTimestamp.checked) {

        csvRows.push([
            "Exported At",
            exportTimestamp
        ]);

        // Blank row
        csvRows.push([]);

    }

    // Table heading
    csvRows.push(headers);

    // Table data
    csvRows.push(...rows);

    const csvContent = csvRows
        .map(row =>
            row.map(escapeCSVValue).join(",")
        )
        .join("\n");

    const blob = new Blob(
        [csvContent],
        {
            type: "text/csv;charset=utf-8;"
        }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download =
        `ticket-sla-report-${getExportFileTimestamp()}.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}

function formatCSVDateTime(date) {
    return date.getFullYear() + "-" +
        String(date.getMonth() + 1).padStart(2, "0") + "-" +
        String(date.getDate()).padStart(2, "0") + " " +
        String(date.getHours()).padStart(2, "0") + ":" +
        String(date.getMinutes()).padStart(2, "0") + ":" +
        String(date.getSeconds()).padStart(2, "0");
}


function excelDateSerial(date) {

    const utcDate = Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds(),
        date.getMilliseconds()
    );

    return (
        utcDate -
        Date.UTC(1899, 11, 30)
    ) / (1000 * 60 * 60 * 24);
}


function exportExcel() {
    const ticketsToExport = getTicketsForExport();

    if (ticketsToExport.length === 0) {
        result.innerHTML = `
            <div class="error-message">
                <p>No tickets available to export.</p>
            </div>
        `;
        return;
    }

    const headers = [
        "Ticket ID",
        "Created",
        "Closed",
        "Resolution Time",
        "SLA Allowed",
        "SLA Used",
        "Status",
        "Remaining/Exceeded"
    ];

    const rows = ticketsToExport.map(ticket => {
        const slaResult = calculateSLA(ticket);

        // Make sure Created and Closed are 
        // // actual JavaScript Date objects 
        // const createdDate = new Date(ticket.created); 
        // const closedDate = new Date(ticket.closed);

        // // Calculate only the numeric remaining/exceeded duration
        // const timeDifference = Math.abs(
        //     slaResult.slaMilliseconds - slaResult.difference
        // );

        /*
            Calculate the absolute time difference
            between resolution time and allowed SLA.
        NORMAL / APPROACHING:
        SLA - Resolution = Remaining

        BREACHED:
        Resolution - SLA = Exceeded
        */

        const remainingOrExceeded =
            Math.abs(
                slaResult.slaMilliseconds -
                slaResult.difference
            );

        return [ 
        // Ticket ID 
        ticket.ticketId, 
        
        // Excel date serial number 
        // XLSX.utils.datenum(createdDate), 
        excelDateSerial(ticket.created),       
        // Excel date serial number 
        // XLSX.utils.datenum(closedDate),
        excelDateSerial(ticket.closed), 

        // Resolution Time 
        formatDuration(slaResult.difference), 
        
        // SLA Allowed 
        formatDuration(slaResult.slaMilliseconds), 
        
        // SLA Used 
        `${slaResult.percentage}%`, 
        
        // Status 
        slaResult.status, 
        
        // ONLY duration — no "Remaining Time:" // or "Exceeded By:" 
        formatDuration(remainingOrExceeded) 
    ];
});


    // --------------------------------
    // Build worksheet data
    // --------------------------------

    const worksheetData = [];

    if (includeTimestamp.checked) {
        worksheetData.push([
            "Exported At",
            // XLSX.utils.datenum(new Date())
            excelDateSerial(new Date())
        ]);

        // Blank row
        worksheetData.push([]);
    }

    worksheetData.push(headers);
    worksheetData.push(...rows);

    // --------------------------------
    // Create worksheet
    // --------------------------------

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // --------------------------------
    // Format Export Timestamp
    // --------------------------------

    if (includeTimestamp.checked) {
        if (worksheet["B1"]) {
            worksheet["B1"].z = "yyyy-mm-dd hh:mm:ss";
        }
    }

    // --------------------------------
    // Determine first ticket data row
    // --------------------------------

    // With timestamp:
    // Row 1 = Exported At
    // Row 2 = blank
    // Row 3 = headers
    // Row 4 = first ticket
    //
    // Without timestamp:
    // Row 1 = headers
    // Row 2 = first ticket

    const dataStartRow = includeTimestamp.checked ? 3 : 1;

    // --------------------------------
    // Format Created and Closed
    // as Excel date/time values
    // --------------------------------

    for (
        let row = dataStartRow;
        row < worksheetData.length;
        row++
    ) {
        const createdCell = worksheet[
            XLSX.utils.encode_cell({
                r: row,
                c: 1
            })
        ];

        const closedCell = worksheet[
            XLSX.utils.encode_cell({
                r: row,
                c: 2
            })
        ];

        if (createdCell) {
            createdCell.t = "n";
            createdCell.z = "yyyy-mm-dd hh:mm:ss";
        }

        if (closedCell) {
            closedCell.t = "n";
            closedCell.z = "yyyy-mm-dd hh:mm:ss";
        }
    }

    // --------------------------------
    // Column widths
    // --------------------------------

    worksheet["!cols"] = [
        { wch: 15 },   // Ticket ID
        { wch: 22 },   // Created
        { wch: 22 },   // Closed
        { wch: 18 },   // Resolution Time
        { wch: 18 },   // SLA Allowed
        { wch: 12 },   // SLA Used
        { wch: 20 },   // Status
        { wch: 20 }    // Remaining/Exceeded
    ];

    // --------------------------------
    // Create workbook
    // --------------------------------

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "SLA Report"
    );

    // --------------------------------
    // Export Excel file
    // --------------------------------

    XLSX.writeFile(
        workbook,
        `ticket-sla-report-${getExportFileTimestamp()}.xlsx`
    );
}



function exportPDF() {

    const ticketsForExport = getTicketsForExport();

    if (ticketsForExport.length === 0) {
        alert("No tickets available to export.");
        return;
    }

    const { jsPDF } = window.jspdf;

    const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
    });

    // Title
    doc.setFontSize(18);
    doc.text("Ticket SLA Report", 14, 15);

    // Export timestamp
    doc.setFontSize(9);
    doc.text(
        `Generated: ${formatCSVDateTime(new Date())}`,
        14,
        22
    );

    const headers = [
        "Ticket ID",
        "Created",
        "Closed",
        "Resolution Time",
        "SLA Allowed",
        "SLA Used",
        "Status",
        "Remaining/Exceeded"
    ];

    const rows = ticketsForExport.map(ticket => {

        const slaResult = calculateSLA(ticket);

        const remainingOrExceeded =
            Math.abs(
                slaResult.slaMilliseconds -
                slaResult.difference
            );

        return [
            ticket.ticketId,
            formatCSVDateTime(ticket.created),
            formatCSVDateTime(ticket.closed),
            formatDuration(slaResult.difference),
            formatDuration(slaResult.slaMilliseconds),
            `${Number(slaResult.percentage).toFixed(2)}%`,
            slaResult.status,
            formatDuration(remainingOrExceeded)
        ];
    });

    doc.autoTable({
        head: [headers],
        body: rows,

        startY: 28,

        theme: "grid",

        styles: {
            fontSize: 7,
            cellPadding: 2,
            valign: "middle"
        },

        headStyles: {
            fontStyle: "bold"
        }
    });

    doc.save(`ticket-sla-report-${getExportFileTimestamp()}.pdf`);
}





function getTicketsForExport() {

    if (exportScope.value === "filtered") {
        return getSortedTickets(getFilteredTickets());
    }

    return tickets;
}

function escapeCSVValue(value) {

    const stringValue = String(value);

    return `"${stringValue.replace(/"/g, '""')}"`;
}

function getExportFileTimestamp() {

    const now = new Date();

    const year = now.getFullYear();

    const month =
        String(now.getMonth() + 1).padStart(2, "0");

    const day =
        String(now.getDate()).padStart(2, "0");

    const hours =
        String(now.getHours()).padStart(2, "0");

    const minutes =
        String(now.getMinutes()).padStart(2, "0");

    const seconds =
        String(now.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}

loadTickets();

renderTickets();

updateDashboard();



// =========================
// PAGE NAVIGATION
// =========================

const navButtons = document.querySelectorAll(".nav-btn");
const pageSections = document.querySelectorAll(".page-section");

function showPage(pageId) {

    navButtons.forEach(button => {
        button.classList.remove("active");
    });

    pageSections.forEach(section => {
        section.classList.remove("active");
    });

    const selectedButton = document.querySelector(
        `.nav-btn[data-page="${pageId}"]`
    );

    const selectedPage = document.getElementById(pageId);

    if (selectedButton) {
        selectedButton.classList.add("active");
    }

    if (selectedPage) {
        selectedPage.classList.add("active");
    }
}

navButtons.forEach(button => {
    button.addEventListener("click", function () {
        showPage(button.dataset.page);
    });
});