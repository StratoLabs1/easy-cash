const contractAddress = '0x54673e24D608E5135Eb0F6628E2179a72f1aF6aD';
const abi = [{"inputs":[{"internalType":"contract IERC20","name":"_usdt","type":"address"},{"internalType":"address","name":"_owner","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"category","type":"uint256"},{"indexed":true,"internalType":"address","name":"winner","type":"address"},{"indexed":false,"internalType":"uint256","name":"ticketNumber","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"prizeAmount","type":"uint256"}],"name":"LotteryWinner","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"buyer","type":"address"},{"indexed":true,"internalType":"uint256","name":"category","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"ticketNumber","type":"uint256"}],"name":"TicketPurchased","type":"event"},{"inputs":[{"internalType":"uint256","name":"category","type":"uint256"},{"internalType":"address","name":"referrer","type":"address"}],"name":"buyTicket","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getUserTickets","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"ticketCounter","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"tickets","outputs":[{"internalType":"uint256","name":"category","type":"uint256"},{"internalType":"address","name":"buyer","type":"address"},{"internalType":"uint256","name":"ticketNumber","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"usdt","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"userTickets","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}];  // Your contract's ABI goes here
const usdtAddress = '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9'; // USDT contract address
const usdtAbi = [{"inputs":[{"internalType":"address","name":"_logic","type":"address"},{"internalType":"address","name":"admin_","type":"address"},{"internalType":"bytes","name":"_data","type":"bytes"}],"stateMutability":"payable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"previousAdmin","type":"address"},{"indexed":false,"internalType":"address","name":"newAdmin","type":"address"}],"name":"AdminChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"beacon","type":"address"}],"name":"BeaconUpgraded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"implementation","type":"address"}],"name":"Upgraded","type":"event"},{"stateMutability":"payable","type":"fallback"},{"inputs":[],"name":"admin","outputs":[{"internalType":"address","name":"admin_","type":"address"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newAdmin","type":"address"}],"name":"changeAdmin","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"implementation","outputs":[{"internalType":"address","name":"implementation_","type":"address"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newImplementation","type":"address"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"upgradeToAndCall","outputs":[],"stateMutability":"payable","type":"function"},{"stateMutability":"payable","type":"receive"}];  // Your USDT ABI goes here

const web3 = new Web3(Web3.givenProvider || 'https://arb1.arbitrum.io/rpc/'); // Arbitrum RPC URL
let contract;
let usdtContract;
let userAddress;

// Initialize the contract and wallet connection
async function init() {
    try {
        document.getElementById('loading').classList.remove('hidden');
        const accounts = await web3.eth.requestAccounts();
        userAddress = accounts[0];
        contract = new web3.eth.Contract(abi, contractAddress);
        usdtContract = new web3.eth.Contract(usdtAbi, usdtAddress);
        updateUIForWalletConnection();

        const networkId = await web3.eth.net.getId();
        if (networkId !== 42161) {
            document.getElementById('network-info').innerText = 'Please switch to the Arbitrum One network.';
        } else {
            document.getElementById('network-name').innerText = 'Arbitrum One';
        }

        listenForEvents();
    } catch (error) {
        handleError(error);
    } finally {
        document.getElementById('loading').classList.add('hidden');
    }
}

// Update UI based on wallet connection status
function updateUIForWalletConnection() {
    if (userAddress) {
        document.getElementById('wallet-address').innerText = userAddress;
        document.getElementById('connect-wallet').innerText = 'Disconnect Wallet';
    } else {
        document.getElementById('wallet-address').innerText = '';
        document.getElementById('connect-wallet').innerText = 'Connect Wallet';
    }
}

// Handle connect/disconnect button click
document.getElementById('connect-wallet').addEventListener('click', async () => {
    if (userAddress) {
        handleDisconnect();
    } else {
        await connectWallet();
    }
});

// Handle account changes
window.ethereum.on('accountsChanged', (accounts) => {
    if (accounts.length > 0) {
        userAddress = accounts[0];
        updateUIForWalletConnection();
    } else {
        handleDisconnect();
    }
});

// Handle disconnecting the wallet
function handleDisconnect() {
    userAddress = null;
    updateUIForWalletConnection();
}

// Connect to the wallet
async function connectWallet() {
    try {
        const accounts = await web3.eth.requestAccounts();
        userAddress = accounts[0];
        updateUIForWalletConnection();
    } catch (error) {
        document.getElementById('error-text').innerText = 'Wallet connection failed.';
    }
}

// Listen for contract events (same as your current implementation)
function listenForEvents() {
    // ... Your existing event listeners here ...
}

// Initialize the app
init();
