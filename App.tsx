import React, { useState, useEffect, useCallback } from 'react';
import { useAtm } from './hooks/useAtm';
import { Screen } from './types';
import { Keypad } from './components/Keypad';
import { CardSlot } from './components/CardSlot';
import { CheckCircleIcon, ScannerIcon } from './components/icons';

const ScreenWrapper: React.FC<{ title?: string; children: React.ReactNode; }> = ({ title, children }) => (
    <div className="w-full h-full p-6 md:p-8 flex flex-col justify-between text-center text-cyan-200">
        {title && <h1 className="text-3xl font-mono font-bold tracking-wider mb-6">{title}</h1>}
        <div className="flex-grow flex flex-col justify-center">
            {children}
        </div>
    </div>
);

const AtmButton: React.FC<{ onClick: () => void; children: React.ReactNode, className?: string }> = ({ onClick, children, className = '' }) => (
    <button
        onClick={onClick}
        className={`w-full text-left p-4 bg-gray-700/50 hover:bg-cyan-900/50 border border-cyan-500/30 text-cyan-200 text-xl font-mono rounded-lg transition-all duration-200 ${className}`}
    >
        {children}
    </button>
);

const TransactionInput: React.FC<{ value: string; onValueChange: (value: string) => void, placeholder?: string, maxLength?: number, type?: 'text'|'password'|'email' }> = ({ value, onValueChange, placeholder, maxLength, type='text' }) => {
    const isOtp = type === 'password';

    return (
        <div className="w-full text-center mb-6">
            <input 
              type={type}
              value={value}
              onChange={(e) => onValueChange(e.target.value)}
              placeholder={placeholder}
              maxLength={maxLength}
              className="hidden" // Hide the actual input
            />
             <div className="text-4xl font-mono p-4 bg-black/30 rounded-lg tracking-widest border border-cyan-500/30">
                { isOtp ? (value ? '•'.repeat(value.length) : placeholder) : (value ? `$${value}` : placeholder || "$0") }
             </div>
        </div>
    );
};


// Page Components
const LoginPage: React.FC<{ onLogin: (email: string) => void; error: string }> = ({ onLogin, error }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin(email);
    };

    return (
        <ScreenWrapper title="ATM Login">
            <form onSubmit={handleLogin} className="flex flex-col space-y-4 max-w-sm mx-auto">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter Email"
                    required
                    className="w-full text-center text-xl font-mono p-3 bg-black/30 rounded-lg tracking-wider border border-cyan-500/30 text-white"
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter Password"
                    required
                    className="w-full text-center text-xl font-mono p-3 bg-black/30 rounded-lg tracking-wider border border-cyan-500/30 text-white"
                />
                <div className="h-6">
                    {error && <p className="text-red-400">{error}</p>}
                </div>
                <button
                    type="submit"
                    disabled={!email || !password}
                    className="w-full px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xl rounded-lg shadow-lg disabled:bg-gray-500 disabled:cursor-not-allowed"
                >
                    Login
                </button>
            </form>
        </ScreenWrapper>
    );
};


const HomePage: React.FC<{ onInsertCard: () => void; isLoading: boolean }> = ({ onInsertCard, isLoading }) => (
    <ScreenWrapper title="Welcome to React Bank">
        {isLoading ? (
            <div className="flex flex-col items-center justify-center space-y-4">
                <ScannerIcon className="w-24 h-24 text-cyan-400" />
                <p className="text-2xl font-mono animate-pulse">Scanning Card...</p>
            </div>
        ) : (
             <div className="flex flex-col items-center justify-center space-y-6">
                <p className="text-xl">Please insert your card to begin</p>
                <button
                    onClick={onInsertCard}
                    disabled={isLoading}
                    className="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xl rounded-lg shadow-lg shadow-cyan-500/30 transition-all transform active:scale-95 disabled:bg-gray-500 disabled:cursor-wait"
                >
                    Insert Card
                </button>
            </div>
        )}
    </ScreenWrapper>
);

const OtpInputPage: React.FC<{ email: string; onSubmit: (otp: string) => void; onCancel: () => void; isLoading: boolean, error: string }> = ({ email, onSubmit, onCancel, isLoading, error }) => {
    const [otp, setOtp] = useState('');
    const [timeLeft, setTimeLeft] = useState(120);

    useEffect(() => {
        if (timeLeft === 0) return;
        const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        return () => clearTimeout(timer);
    }, [timeLeft]);
    
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    const handleKeyPress = (key: string) => setOtp(prev => (prev + key).slice(0, 6));
    const handleBackspace = () => setOtp(prev => prev.slice(0, -1));
    const handleClear = () => setOtp('');

    return (
        <ScreenWrapper title="Enter OTP">
            <div className='flex-grow flex flex-col justify-around'>
                <div>
                    <p className="mb-2">An OTP has been sent to:</p>
                    <p className="font-bold break-words">{email}</p>
                </div>
                
                <TransactionInput value={otp} onValueChange={setOtp} placeholder="------" maxLength={6} type="password"/>
                
                <div className="h-6 mb-2">
                    {error ? (
                        <p className="text-red-400">{error}</p>
                    ) : (
                        <p className="text-yellow-400">
                            {timeLeft > 0 ? `Expires in: ${minutes}:${seconds < 10 ? `0${seconds}` : seconds}` : 'OTP Expired!'}
                        </p>
                    )}
                </div>
                
                <Keypad onKeyPress={handleKeyPress} onBackspace={handleBackspace} onClear={handleClear} />

                <div className="mt-6 grid grid-cols-2 gap-4">
                    <button
                        onClick={() => onSubmit(otp)}
                        disabled={isLoading || otp.length !== 6 || timeLeft === 0}
                        className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg shadow-lg disabled:bg-gray-500 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Verifying...' : 'Verify'}
                    </button>
                     <button
                        onClick={onCancel}
                        className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg shadow-lg"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </ScreenWrapper>
    );
};


const OperationsPage: React.FC<{ onWithdraw: () => void; onDeposit: () => void; onCheckBalance: () => void; onExit: () => void; }> = ({ onWithdraw, onDeposit, onCheckBalance, onExit }) => (
    <ScreenWrapper title="Main Menu">
        <div className="grid grid-cols-2 gap-4">
            <AtmButton onClick={onWithdraw}>Withdraw Cash</AtmButton>
            <AtmButton onClick={onCheckBalance}>Check Balance</AtmButton>
            <AtmButton onClick={onDeposit}>Deposit Cash</AtmButton>
            <AtmButton onClick={onExit} className="bg-red-800/50 hover:bg-red-900/50">Exit & Logout</AtmButton>
        </div>
    </ScreenWrapper>
);

const TransactionPage: React.FC<{ title: string; currentBalance: number; onConfirm: (amount: number) => void; onCancel: () => void; error: string; }> = ({ title, currentBalance, onConfirm, onCancel, error }) => {
    const [amount, setAmount] = useState('');
    
    const handleKeyPress = (key: string) => setAmount(prev => (prev + key).slice(0, 6));
    const handleBackspace = () => setAmount(prev => prev.slice(0, -1));
    const handleClear = () => setAmount('');

    return (
        <ScreenWrapper title={title}>
            <p className="mb-2 text-lg">Current Balance: ${currentBalance.toLocaleString()}</p>
             <TransactionInput value={amount} onValueChange={setAmount} />

            <div className="h-6 mb-4">
                 {error && <p className="text-red-400">{error}</p>}
            </div>

            <Keypad onKeyPress={handleKeyPress} onBackspace={handleBackspace} onClear={handleClear} />
            
            <div className="mt-6 grid grid-cols-2 gap-4">
                <button onClick={() => onConfirm(Number(amount))} className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg shadow-lg disabled:bg-gray-500" disabled={!amount || Number(amount) <= 0}>
                    Confirm
                </button>
                 <button onClick={onCancel} className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg shadow-lg">
                    Cancel
                </button>
            </div>
        </ScreenWrapper>
    );
};

const BalancePage: React.FC<{ balance: number; onBack: () => void; }> = ({ balance, onBack }) => (
    <ScreenWrapper title="Account Balance">
        <p className="text-2xl mb-4">Your current balance is:</p>
        <p className="text-6xl font-mono font-bold tracking-widest text-green-400">${balance.toLocaleString()}</p>
        <button onClick={onBack} className="mt-12 mx-auto px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xl rounded-lg shadow-lg">
            Back to Menu
        </button>
    </ScreenWrapper>
);

const FinalPage: React.FC<{ message: string; lastTransaction: {type: string, amount: number} | null; balance: number; onExit: () => void, onMore: () => void }> = ({ message, lastTransaction, balance, onExit, onMore }) => (
    <ScreenWrapper title="Transaction Complete">
        <div className="flex flex-col items-center space-y-4">
            <CheckCircleIcon className="w-24 h-24 text-green-400"/>
            <p className="text-2xl text-green-300">{message}</p>
            {lastTransaction && <p className="text-xl">{lastTransaction.type} Amount: <span className="font-bold">${lastTransaction.amount.toLocaleString()}</span></p>}
            <p className="text-xl">New Balance: <span className="font-bold font-mono text-2xl">${balance.toLocaleString()}</span></p>

            <p className="text-lg pt-8">Would you like another transaction?</p>
             <div className="mt-6 w-full max-w-sm grid grid-cols-2 gap-4">
                <button onClick={onMore} className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg shadow-lg">
                    Yes
                </button>
                 <button onClick={onExit} className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg shadow-lg">
                    No (Exit & Logout)
                </button>
            </div>
        </div>
    </ScreenWrapper>
);


function App() {
  const { screen, balance, loggedInEmail, isLoading, error, message, cardSlotStatus, lastTransaction, handlers } = useAtm();

  const renderScreen = useCallback(() => {
    switch (screen) {
      case Screen.LOGIN:
        return <LoginPage onLogin={handlers.login} error={error} />;
      case Screen.HOME:
        return <HomePage onInsertCard={handlers.insertCard} isLoading={isLoading} />;
      case Screen.OTP_INPUT:
        return <OtpInputPage email={loggedInEmail} onSubmit={handlers.submitOtp} onCancel={handlers.cancel} isLoading={isLoading} error={error} />;
      case Screen.OPERATIONS:
        return <OperationsPage onWithdraw={handlers.goToWithdraw} onDeposit={handlers.goToDeposit} onCheckBalance={handlers.goToCheckBalance} onExit={handlers.logout} />;
      case Screen.WITHDRAW:
        return <TransactionPage title="Withdraw Cash" currentBalance={balance} onConfirm={handlers.withdraw} onCancel={handlers.cancel} error={error} />;
      case Screen.DEPOSIT:
        return <TransactionPage title="Deposit Cash" currentBalance={balance} onConfirm={handlers.deposit} onCancel={handlers.cancel} error={error} />;
      case Screen.BALANCE:
        return <BalancePage balance={balance} onBack={handlers.goToOperations} />;
      case Screen.FINAL:
        return <FinalPage message={message} lastTransaction={lastTransaction} balance={balance} onExit={handlers.logout} onMore={handlers.goToOperations}/>;
      default:
        return <LoginPage onLogin={handlers.login} error={error} />;
    }
  }, [screen, balance, loggedInEmail, isLoading, error, message, lastTransaction, handlers]);

  return (
    <div className="min-h-screen w-full bg-gray-900 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-lg bg-gray-800 rounded-2xl shadow-2xl shadow-black/50 border-4 border-gray-700 flex flex-col">
        {/* ATM Screen */}
        <div className="w-full h-[600px] md:h-[650px] bg-blue-900/20 rounded-t-lg border-b-4 border-gray-700 p-4">
          <div className="w-full h-full bg-black rounded-lg border-2 border-black shadow-inner overflow-hidden">
            {renderScreen()}
          </div>
        </div>
        
        {/* ATM Body */}
        <div className="p-6 bg-gray-700 rounded-b-lg">
            <CardSlot status={cardSlotStatus} />
        </div>
      </div>
       <footer className="text-gray-500 mt-4 text-sm">
        React ATM Simulator
      </footer>
    </div>
  );
}

export default App;