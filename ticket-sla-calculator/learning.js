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
    const created = new Date(createdTime.value);
    const closed = new Date(closedTime.value);
    // console.log(`Ticket ID: ${ticketId.value}`);
    // console.log(createdTime.value);
    // console.log(closedTime.value);
    // console.log(slaHours.value);
    // console.log(created);
    // console.log(closed);
    const difference = closed - created;
    const slaMilliseconds = slaHours.value * 60 * 60 * 1000;
    // const differenceHours =
    // difference / (1000 * 60 * 60);
    // console.log(difference);
    // console.log(`Resolution: ${formatDuration(difference)}`);
    // console.log
    // (`SLA: ${slaHours.value} hours`);

if (difference <= slaMilliseconds) {
    const remaining = slaMilliseconds - difference;
    // console.log("SLA MET");
    // console.log(
    // `Remaining: ${formatDuration(remaining)}`
    result.innerHTML = `<h2>SLA MET</h2>
    <p>Resolution Time: ${formatDuration(difference)}</p>
    <p>SLA Allowed: ${formatDuration(slaMilliseconds)}</p>
    <p>Remaining Time: ${formatDuration(remaining)}</p>
    `;
} 
else {
    const exceeded = difference - slaMilliseconds;
    // result.innerHTML = `<h2>SLA BREACHED</h2>
     // console.log("SLA BREACHED");
    // console.log(
    // `Exceeded By: ${formatDuration(exceeded)}` 
// );
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

        <p>
            <strong>Exceeded By:</strong>
            ${formatDuration(exceeded)}
        </p>

    // <h2>SLA BREACHED</h2>
    // <p>Resolution Time: ${formatDuration(difference)}</p>
    // <p>SLA Allowed: ${formatDuration(slaMilliseconds)}</p>
    // <p>Exceeded By: ${formatDuration(exceeded)}</p>

    `;
    }
}

);

resetBtn.addEventListener("click", function () {
    ticketId.value = "";
    createdTime.value = "";
    closedTime.value = "";
    slaHours.value = "";
    result.innerHTML = "";
});


