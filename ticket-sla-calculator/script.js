const ticketId = document.getElementById("ticketId");
const createdTime = document.getElementById('createdTime');
const closedTime = document.getElementById('closedTime');
const slaHours = document.getElementById('slaHours');
const calculateBtn = document.getElementById('calculateBtn');
const resetBtn = document.getElementById("resetBtn");
const result = document.getElementById('result');


function formatDuration(milliseconds) {
    const totalMinutes = Math.floor(milliseconds / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
}


calculateBtn.addEventListener("click", function () {
    // Input Validation

const errors = [];

if (!ticketId.value.trim()) {
    errors.push("Ticket ID is required.");
}

if (!createdTime.value) {
    errors.push("Created date and time is required.");
}

if (!closedTime.value) {
    errors.push("Closed date and time is required.");
}

if (!slaHours.value) {
    errors.push("SLA hours is required.");
}

if (errors.length > 0) {

    result.innerHTML = `
        <div class="error-message">
            <h2>⚠ Please check your input</h2>
            <ul>
                ${errors.map(error => `<li>${error}</li>`).join("")}
            </ul>
        </div>
    `;

    return;
}

    // if (!ticketId.value|| 
    //     !createdTime.value || 
    //     !closedTime.value || 
    //     !slaHours.value
    // ) {
    //     result.innerHTML = `<h2>Error</h2>
    //     <p>Please fill in all fields.</p>`;
    //     return;
    // }

    // SLA Validation
    const slaInput = slaHours.value.trim();
    const sla = Number(slaInput);
    if (Number.isNaN(sla) || sla <= 0) {
        result.innerHTML = "<p>SLA must be a valid number greater than 0.</p>";
        return;
    } 

    // convert dates
    const created = new Date(createdTime.value);
    const closed = new Date(closedTime.value);

    // Validate dates
    if (Number.isNaN(created.getTime())) {
        result.innerHTML =
            "<p>Created date/time is invalid.</p>";
        return;
    }

    if (Number.isNaN(closed.getTime())) {
        result.innerHTML =
            "<p>Closed date/time is invalid.</p>";
        return;
    }

    // calculate resolution time
    const difference = closed - created;

    // check date order
    if (difference < 0) {
    result.innerHTML =
        "<p>Closed time cannot be earlier than Created time.</p>";
    return;
    }
          
    // convert sla hours to milliseconds
    const slaMilliseconds = sla * 60 * 60 * 1000;

    // calculate sla percentage
    const slaPercentage = (difference / slaMilliseconds) * 100;
    const percentage = slaPercentage.toFixed(1);

    // check SLA
if (difference <= slaMilliseconds) {
    const remaining = slaMilliseconds - difference;
    const progressWidth = Math.min(slaPercentage, 100);
    result.innerHTML = `    
        <div class = "sla-status met"> 
            <h2">SLA MET</h2>
        </div>

        <p>
        <strong>Ticket ID:</strong>
        ${ticketId.value}
        </p>

        <p>
            <strong>Resolution Time:</strong>
            ${formatDuration(difference)}
        </p>

        <p>
            <strong>SLA Allowed:</strong>
            ${formatDuration(slaMilliseconds)}
        </p>

        <p>
            <strong>SLA Used:</strong>
            ${percentage}%
        </p>

        <div class="progress-container">
            <div
                class="progress-bar met"
                style="width: ${progressWidth}%">
            </div>
        </div>

        <p>
            <strong>Remaining Time:</strong>
            ${formatDuration(remaining)}
        </p>>-->

        <!--// <p>SLA Allowed: ${formatDuration(slaMilliseconds)}</p>-->
        <!--// <p>Remaining Time: ${formatDuration(remaining)}</p>-->
    `;
} 
else {
    const exceeded = difference - slaMilliseconds;
    const progressWidth = Math.min(slaPercentage,100);
    result.innerHTML = `
        <div class="sla-status breached">
                <h2>SLA BREACHED</h2>
        </div>

        <p><strong>Ticket ID:</strong> ${ticketId.value}</p>

        <p>
            <strong>Resolution Time:</strong>
            ${formatDuration(difference)}
        </p>

        <p>
            <strong>SLA Allowed:</strong>
            ${formatDuration(slaMilliseconds)}
        </p>

        <p>
            <strong>SLA Used:</strong>
            ${percentage}%
        </p>

        <div class="progress-container">
            <div
                class="progress-bar breached"
                style="width: ${progressWidth}%">
            </div>
        </div>

        <p>
            <strong>Exceeded By:</strong>
            ${formatDuration(exceeded)}
        </p>

        <!-- // <h2>SLA BREACHED</h2> -->
        <!--// <p>Resolution Time: ${formatDuration(difference)}</p> -->
        <!--// <p>SLA Allowed: ${formatDuration(slaMilliseconds)}</p> -->
        <!--// <p>Exceeded By: ${formatDuration(exceeded)}</p> -->
    `;
}

});


resetBtn.addEventListener("click", function () {
    ticketId.value = "";
    createdTime.value = "";
    closedTime.value = "";
    slaHours.value = "";
    result.innerHTML = "";
});
