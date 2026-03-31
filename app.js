const select = document.getElementById("select");
const input = document.getElementById("input");
const dashboardEl = document.getElementById("dashboard");

const scaitsFeeEl = document.getElementById("scaitsFee");
const totalConcessionEl = document.getElementById("totalConcession");
const netFeeEl = document.getElementById("netFee");
const gstFeeEl = document.getElementById("gstFee");
const totalPayableEl = document.getElementById("totalPayable");
const firstYearConcessionEl = document.getElementById("firstYearConcession");
const secondYearConcessionEl = document.getElementById("secondYearConcession");
const yearNoteEl = document.getElementById("yearNote");

const data = {
  Select: "",
  "6th": { scaitsfee: 48500, uniform: 2625, study: 2500, excelfee: 56455 },
  "7th": { scaitsfee: 48500, uniform: 2625, study: 2500, excelfee: 56455 },
  "8th": { scaitsfee: 49500, uniform: 2625, study: 2500, excelfee: 57635 },
  "9th": { scaitsfee: 68500, uniform: 2625, study: 2500, excelfee: 80055 },
  "10th": { scaitsfee: 72500, uniform: 2625, study: 2500, excelfee: 84775 },
  "11th-NM": {
    scaitsfee: 191100,
    uniform: 5250,
    study: 17080,
    excelfee: 318500,
    sec_fee: 127400,
  },
  "11th-MED": {
    scaitsfee: 182100,
    uniform: 5250,
    study: 17080,
    excelfee: 303500,
    sec_fee: 121400,
  },
  "(12th/Dropper)-NM": {
    scaitsfee: 163000,
    uniform: 2625,
    study: 5000,
    excelfee: 191115,
  },
  "(12th/Dropper)-MED": {
    scaitsfee: 155500,
    uniform: 2625,
    study: 5000,
    excelfee: 182265,
  },
};

const initialState = {
  scaitsFee: 0,
  totalConcession: 0,
  netFee: 0,
  gst: 0,
  totalPayable: 0,
  firstYearConcession: 0,
  secondYearConcession: 0,
  yearNote: "Select a class and enter amount to view concession split.",
};

for (const key in data) {
  const option = document.createElement("option");
  const isPlaceholder = key === "Select";
  option.value = isPlaceholder ? "" : key;
  option.textContent = isPlaceholder ? "Select Class" : key;
  if (isPlaceholder) {
    option.disabled = true;
    option.selected = true;
    option.hidden = true;
  }
  select.appendChild(option);
}

function formatCurrency(value) {
  const safeValue = Number.isFinite(value) ? Math.round(value) : 0;
  const absoluteValue = Math.abs(safeValue).toLocaleString("en-IN");
  return safeValue < 0 ? `-\u20B9 ${absoluteValue}` : `\u20B9 ${absoluteValue}`;
}

function setText(element, value) {
  element.textContent = formatCurrency(value);
}

function isYearWiseClass(selectedClass) {
  return selectedClass === "11th-NM" || selectedClass === "11th-MED";
}

function toggleYearWiseSection(selectedClass) {
  dashboardEl.classList.toggle("yearwise-hidden", !isYearWiseClass(selectedClass));
}

function render(state = initialState) {
  setText(scaitsFeeEl, state.scaitsFee);
  setText(totalConcessionEl, state.totalConcession);
  setText(netFeeEl, state.netFee);
  setText(gstFeeEl, state.gst);
  setText(totalPayableEl, state.totalPayable);
  setText(firstYearConcessionEl, state.firstYearConcession);
  setText(secondYearConcessionEl, state.secondYearConcession);
  yearNoteEl.textContent = state.yearNote;
}

function calculate() {
  const selectedClass = select.value;
  const config = data[selectedClass];
  const inputValue = Number.parseInt(input.value, 10);

  if (!config) {
    toggleYearWiseSection("");
    render(initialState);
    return;
  }

  toggleYearWiseSection(selectedClass);

  const state = {
    scaitsFee: config.excelfee,
    totalConcession: 0,
    netFee: 0,
    gst: 0,
    totalPayable: Number.isFinite(inputValue) ? inputValue : 0,
    firstYearConcession: 0,
    secondYearConcession: 0,
    yearNote: "Single-year batch. Year-wise split is available for 11th programs.",
  };

  if (!Number.isFinite(inputValue) || inputValue < 0) {
    render(state);
    return;
  }

  if (selectedClass === "11th-NM" || selectedClass === "11th-MED") {
    const oneYear = inputValue * 0.6;
    const secondYear = inputValue * 0.4;
    const secondYearNetFee = Math.round(secondYear / 1.18);
    const secondYearConcession = config.sec_fee - secondYearNetFee;
    const grossFee = oneYear - 10000 - config.uniform;
    const netFee = Math.round(grossFee / 1.18 + 5000 + 10000 + secondYearNetFee);
    const firstYearNetFee = Math.round(grossFee / 1.18 + 5000 + 10000);
    const firstYearConcession = config.scaitsfee - firstYearNetFee;

    state.totalConcession = firstYearConcession + secondYearConcession;
    state.netFee = netFee;
    state.gst = Math.round(inputValue - netFee);
    state.totalPayable = oneYear + secondYear;
    state.firstYearConcession = firstYearConcession;
    state.secondYearConcession = secondYearConcession;
    state.yearNote = "11th program detected. Concession is split between 1st and 2nd year.";
  } else if (
    selectedClass === "(12th/Dropper)-NM" ||
    selectedClass === "(12th/Dropper)-MED"
  ) {
    const grossFee = inputValue - config.study - config.uniform;
    const netFee = Math.round(grossFee / 1.18) + 2500 + 5000;
    const concession = config.scaitsfee - netFee;

    state.totalConcession = concession;
    state.netFee = netFee;
    state.gst = Math.round(netFee * 0.18);
    state.totalPayable = grossFee + config.study + config.uniform;
    state.yearNote = "Dropper / 12th batch is calculated as a single-year concession.";
  } else {
    const grossFee = inputValue - config.study - config.uniform;
    const netFee = Math.round(grossFee / 1.18) + 2500 + 2500;
    const concession = config.scaitsfee - netFee;

    state.totalConcession = concession;
    state.netFee = netFee;
    state.gst = Math.round(netFee * 0.18);
    state.totalPayable = grossFee + config.study + config.uniform;
  }

  render(state);
}

select.addEventListener("change", calculate);
input.addEventListener("input", calculate);

render();
