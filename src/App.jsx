import Layout from './components/layout';

function App() {
  return (
    <Layout>
    {/* This is where your page content will load */}
    <section className="py-20 px-6 max-w-5xl mx-auto">
    <h1 className="text-6xl font-black uppercase italic mb-4">
    Precision <span className="text-weld-red">Fabrication</span>
    </h1>
    <p className="text-weld-silver text-xl max-w-2xl">
    Structural integrity meets neighborhood reliability.
    Quality welds for Jacksonville's toughest projects.
    </p>
    </section>
    </Layout>
  );
}

export default App;
