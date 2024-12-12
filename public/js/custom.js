// to get current year
function getYear() {
    var currentDate = new Date();
    var currentYear = currentDate.getFullYear();
    document.querySelector("#displayYear").innerHTML = currentYear;
}

getYear();


function copyContractAddress() {
    const contractAddress = 'ASniBZAKtrepawfHU9McMfxbbYjayScD67oq451HaHCy'; 
    navigator.clipboard.writeText(contractAddress);
  }

function showMore() {
    var fullText = document.getElementById('disclaimerText');
    var readButton = document.getElementById('readMore');
    if (fullText.style.display === 'none') {
      fullText.style.display = 'inline';
      readButton.innerHTML = 'understood';
    } else {
      fullText.style.display = 'none';
      readButton.innerHTML = 'read more';
    }
  }