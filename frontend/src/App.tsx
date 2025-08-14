import Header from './components/Header';
import Footer from './components/Footer';
import LeadUpload from './components/LeadUpload';
import './style/App.css';
import './style/Header.css';
import './style/LeadUpload.css';

function App() {
  return (
    <div className="App">
      <Header />
      <main style={{minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
        <LeadUpload />
      </main>
      <Footer />
    </div>
  );
}

export default App;
