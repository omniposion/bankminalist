'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2023-08-11T23:36:17.929Z',
    '2023-08-14T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2023-08-10T18:49:59.371Z',
    '2023-08-15T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs((date2 - date1) / (1000 * 60 * 60 * 24))); // to days;
  const daysPassed = calcDaysPassed(new Date(), date);
  console.log(daysPassed);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  else {
    // const day = `${date.getDate()}`.padStart(2, 0);
    // const month = `${date.getMonth() + 1}`.padStart(2, 0); // +1 becuase it's zerobased indexed
    // const year = date.getFullYear();
    // return `${day}/${month}/${year}`;
    return new Intl.DateTimeFormat(locale).format(date);
  }
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);

    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
    <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);

  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

const startLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    // in each call, print remaining time to UI
    labelTimer.textContent = `${min}:${sec}`;

    // when timer is 0, stop timer and log out user
    if (time === 0) {
      clearInterval(timeLogOut);
      labelWelcome.textContent = 'Login to get started';
      containerApp.style.opacity = 0;
    }

    // decrease 1s
    time--;
  };
  // set time to 5 minutes
  let time = 300;
  // call the timer every second
  tick();
  const timeLogOut = setInterval(tick, 1000);
  return timeLogOut;
};

///////////////////////////////////////
// Event handlers
let currentAccount, timeLogOut;
// Internationalization API
// Date creation day/month/year

// FAKE ALWAYS LOGGED IN
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // Current date and time
    const timeNow = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      //weekday: 'long',
    };
    //const locale = navigator.language; // get the locale from the users browser

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(timeNow);

    // const timeNow = new Date();
    // const day = `${timeNow.getDate()}`.padStart(2, 0);
    // const month = `${timeNow.getMonth() + 1}`.padStart(2, 0); // +1 becuase it's zerobased indexed
    // const year = timeNow.getFullYear();
    // const hour = `${timeNow.getHours()}`.padStart(2, 0);
    // const minute = `${timeNow.getMinutes()}`.padStart(2, 0);
    // labelDate.textContent = `${day}/${month}/${year}, ${hour}:${minute}`;
    // const calcDaysPassed = (date1, date2) =>
    //   Math.abs((date2 - date1) / (1000 * 60 * 60 * 24));

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();
    // Start the timer
    if (timeLogOut) clearInterval(timeLogOut);
    timeLogOut = startLogOutTimer();

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    setTimeout(function () {
      // Doing the transfer
      currentAccount.movements.push(-amount);
      receiverAcc.movements.push(amount);

      // Add transfer date
      currentAccount.movementsDates.push(new Date().toISOString());
      receiverAcc.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(currentAccount);

      // Reset timer
      clearInterval(timeLogOut);
      timeLogOut = startLogOutTimer();
    }, 2500);
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      // Add movement
      currentAccount.movements.push(amount);

      // Add date to loan
      currentAccount.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(currentAccount);

      // Reset timer
      clearInterval(timeLogOut);
      timeLogOut = startLogOutTimer();
    }, 2500);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});
/*
/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
// In JavaScript all numbers are internally floating point numbers(always as decimals even if we write them as integers)
console.log(23 === 23.0); // true
// Numbers are represented internally in a 64-BASE2(binary) format
// Base10: 0-9
// Binary Base2: 0-1;
console.log(0.1 + 0.2); // is 0.300000000004 cuz of binary
console.log(0.1 + 0.2 === 0.3); // is false by an error

// Conversion
console.log(Number('23')); // convert string to number
console.log(+'23'); // also converts string to number

// Parsing
console.log(Number.parseInt('30px', 10)); // will automatically convert to number if the string starts with a number ,10 for base10, 2 for base2(binary)
console.log('e23sss', 10);

console.log(Number.parseFloat('2.5rm')); // shows 2.5 floating number
console.log(Number.parseInt('2.5rm')); // shows only integer 2, excellent for data out of CSS

// Check if value is Nan
console.log(Number.isNaN(20)); // logs false because it is a Number
console.log(Number.isNaN('20')); // logs false because it is not NaN
console.log(Number.isNaN(+'20X')); // true becuase it is Nan
console.log(Number.isNaN(23 / 0)); // its infinity not a Nan

// Check if a value is a number (best way)
console.log(Number.isFinite(23 / 0)); // false, infinity is not finite b
console.log(Number.isFinite(23)); // true
console.log(Number.isFinite('23')); // false
console.log(Number.isFinite(+'23X')); // false

// Check if a value is an integer number
console.log(Number.isInteger(20)); // true
console.log(Number.isInteger(20.5)); // false cuz its floating

// MATH and ROUNDING
console.log(Math.sqrt(25)); // 5
console.log(25 ** 2); // 25 na kvadrat 2
console.log(8 ** (1 / 3)); // na kub

console.log(Math.max(5, 25, 35, 95, 9)); // logs the maximum number value of the array: 95
console.log(Math.max(5, 25, 35, '95', 9)); // also does coercion still: 95

console.log(Math.min(5, 25, 35, '95', 9)); // logs the minimum number value of the arr: 5

// calculate the area of a circle
console.log(Math.PI * Number.parseFloat('10px') ** 2);

console.log(Math.random()); // valuue between 0-1

// dice roll 6: six numbers
console.log(Math.trunc(Math.random() * 6) + 1);

const randomInt = (min, max) =>
  Math.trunc(Math.random() * (max - min) + 1) + min;
console.log(randomInt(10, 20)); // always get a number betweeen 10-20

// Rounding integers
console.log(Math.trunc(23.3)); // removes the .decimal part so 23
console.log(Math.round(23.5)); // round to the nearest integer so 24

console.log(Math.ceil(23.3)); // ceil is to round down to higher integer so 24
console.log(Math.ceil(23.6)); // also 24, always rounded up

console.log(Math.floor(23.3)); // always rounded down so 23
console.log(Math.floor(-23.3)); // also work with negative numbers rounds down to -24

// Rounding decimals(floating point numbers)
console.log((2.7).toFixed(1)); // returns a string with (1) decimal 2.7
console.log((2.7).toFixed(3)); // returns a string with (3) decimals 2.700
console.log(+(2.744).toFixed(2)); // returns a number with (2) decimals 2.74

// Remainder Operator
console.log(5 % 2); // 1
console.log(5 / 2); // 5 = 2*2 + 1 so 1

console.log(8 % 3); // 2
console.log(8 / 3); //8 = 2 * 3 + 2 so 2

// if a number is even and dividable by 2, the remainder is always 0
console.log(8 % 2); // 0 cuz 8 is even and dividable by 2
console.log(9 % 2); // 9 = 2*4 + 1
console.log(8 % 2);

const isEven = n => n % 2 === 0; // returns true for every even number and false with every odd num
console.log(isEven(8));
console.log(isEven(9));
console.log(isEven(410));
console.log(isEven(514));

labelBalance.addEventListener('click', function () {
  [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
    //if (i % 2 === 0) row.style.backgroundColor = 'orangered'; // every 2nd row is colored
    if (i % 3 === 0) row.style.backgroundColor = 'blue'; // 3rd row is colored
  });
});

// BigInt
// Maximum safe number value
console.log(2 ** 53 - 1);
console.log(Number.MAX_SAFE_INTEGER);
console.log(2 ** 53 + 3); // doesn't represent the numbers accurately after Number.MAX_SAFE_INTEGER

// How to work with highers numbers properly
console.log(4372714761516923954214562374576546230n); // n transforms to a bigInt number
console.log(BigInt(4372713954033333));

// Operations work normally, but can't be mixed with regular numbers

const huge = 203899217689021756321412n;
const num = 10;
console.log(huge * BigInt(num)); // TypeError: Cannot mix BigInt and other types, use explicit conversions
console.log(20n == 20); // true
console.log(20n === 20); // false cuz they're different types


// DATES & TIME
// Create a date
const now = new Date(); // current date time
console.log(now);
console.log(new Date('Wed Aug 16 2023 16:39:34')); // fixed time
console.log(new Date('January 1, 2000'));

console.log(new Date(account1.movementsDates[2]));

// Beggining of UNIX TIME : 1st of January, 1970
console.log(new Date(0));
console.log(new Date(3 * 24 * 60 * 60 * 1000)); // 4th of Jaunuary, 1970
console.log(3 * 24 * 60 * 60 * 1000); // 259200000 is a TIMESTAMP

// Working with dates
const future = new Date(2037, 10, 19, 15, 23);
console.log(future);
console.log(future.getFullYear()); // logs the number 2037
console.log(future.getMonth()); // logs the number 10
console.log(future.getDate()); // logs 19
console.log(future.getDay()); // logs 4 the day of the week
console.log(future.getHours()); // logs 15
console.log(future.getMinutes()); // logs 23
console.log(future.getSeconds());
console.log(future.getMilliseconds()); // logs 0

console.log(future.toISOString());
console.log(future.getTime()); // 2142253380000
console.log(new Date(2142253380000));
console.log(Date.now()); // miliseconds that have passed since 1st of January, 1970

future.setFullYear(2040);
future.setHours(20); // etc to milisceonds


// Dates calculations
const future = new Date(2037, 10, 19, 15, 23);
const past = new Date(1937, 9, 18, 15, 23);

const calcDaysPassed = (date1, date2) =>
  Math.abs((date2 - date1) / (1000 * 60 * 60 * 24));

console.log(
  calcDaysPassed(new Date(2037, 10, 19, 15, 23), new Date(2037, 8, 18, 15, 23))
);

const num = 3884764.23;
const options = {
  style: 'currency',
  unit: 'celsius',
  currency: 'EUR',
};

console.log('US: ', new Intl.NumberFormat('en-US', options).format(num));
console.log('Germany: ', new Intl.NumberFormat('de-DE', options).format(num));
console.log('Syria: ', new Intl.NumberFormat('ar-SY', options).format(num));
console.log(
  'Browser: ',
  new Intl.NumberFormat(navigator.language, options).format(num)
);

// Timers & Timeouts & setInterval

// setTimeout()
const ingredients = ['olives', 'spinach'];

const pizzaTimer = setTimeout(
  (ing1, ing2) => console.log(`Here is your pizza 🍕 with ${ing1} and ${ing2}`),
  3000,
  ...ingredients
);
if (ingredients.includes('spiach')) clearTimeout(pizzaTimer); // cancels the timer

console.log('Waiting...');

// setInterval() - keeps repeating the function every given time e.g. 3000 is 3 seconds
setInterval(function () {
  const timeNow = new Date();
  console.log(timeNow);
}, 1000);
*/
