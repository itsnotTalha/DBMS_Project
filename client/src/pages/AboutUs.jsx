import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Lock, ShieldCheck, Factory, Store, Users, Package, Truck, 
  QrCode, CheckCircle, ArrowRight, ArrowDown, Database, 
  Globe, Smartphone, ChevronDown, ChevronUp, Cpu, Link as LinkIcon,
  Eye, AlertTriangle, BarChart3, Clock, Zap, Award
} from 'lucide-react';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-emerald-500 p-2 rounded-xl shadow-lg shadow-emerald-200">
                <Lock className="text-white w-5 h-5" />
              </div>
              <span className="font-bold text-xl text-slate-900">BESS-PAS</span>
            </Link>
            <nav className="flex items-center gap-4">
              <Link to="/" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
                Home
              </Link>
              <Link to="/login" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Get Started
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <ShieldCheck className="w-4 h-4" />
            Blockchain-Enhanced Supply Security
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
            Product Authentication <br />
            <span className="text-emerald-600">System</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            BESS-PAS ensures product authenticity through blockchain-style traceability, 
            IoT monitoring, and multi-stakeholder verification across the entire supply chain.
          </p>
        </div>
      </section>

      {/* Key Features Grid */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-4">Key Features</h2>
          <p className="text-slate-600 text-center mb-12 max-w-2xl mx-auto">
            A comprehensive system designed to eliminate counterfeit products and ensure transparency
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature Cards */}
            <FeatureCard 
              icon={<LinkIcon className="w-6 h-6" />}
              title="Blockchain Traceability"
              description="Immutable ledger records every transaction, from production to purchase"
              color="emerald"
            />
            <FeatureCard 
              icon={<Cpu className="w-6 h-6" />}
              title="IoT Monitoring"
              description="Real-time sensors track temperature, humidity, and tampering alerts"
              color="blue"
            />
            <FeatureCard 
              icon={<QrCode className="w-6 h-6" />}
              title="QR Verification"
              description="Instant authenticity verification with unique QR codes per product"
              color="purple"
            />
            <FeatureCard 
              icon={<Eye className="w-6 h-6" />}
              title="Full Transparency"
              description="Track complete product journey from factory to consumer"
              color="amber"
            />
            <FeatureCard 
              icon={<AlertTriangle className="w-6 h-6" />}
              title="Fraud Prevention"
              description="Automatic detection and alerts for counterfeit products"
              color="red"
            />
            <FeatureCard 
              icon={<BarChart3 className="w-6 h-6" />}
              title="Analytics Dashboard"
              description="Real-time insights and reports for all stakeholders"
              color="cyan"
            />
          </div>
        </div>
      </section>

      {/* Supply Chain Flow Diagram */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-4">Supply Chain Workflow</h2>
          <p className="text-slate-600 text-center mb-16 max-w-2xl mx-auto">
            Visual representation of how products flow through our authenticated supply chain
          </p>

          {/* Desktop Flow */}
          <div className="hidden lg:block">
            <div className="flex items-center justify-between gap-4">
              <FlowStep 
                icon={<Factory />}
                title="Manufacturer"
                description="Creates product & generates unique ID"
                step={1}
              />
              <FlowArrow />
              <FlowStep 
                icon={<Database />}
                title="Blockchain"
                description="Records creation on immutable ledger"
                step={2}
              />
              <FlowArrow />
              <FlowStep 
                icon={<Truck />}
                title="Shipment"
                description="IoT monitored transport"
                step={3}
              />
              <FlowArrow />
              <FlowStep 
                icon={<Store />}
                title="Retailer"
                description="Receives & verifies products"
                step={4}
              />
              <FlowArrow />
              <FlowStep 
                icon={<Users />}
                title="Customer"
                description="Scans QR to verify authenticity"
                step={5}
              />
            </div>
          </div>

          {/* Mobile Flow */}
          <div className="lg:hidden flex flex-col items-center gap-4">
            <FlowStep 
              icon={<Factory />}
              title="Manufacturer"
              description="Creates product & generates unique ID"
              step={1}
              mobile
            />
            <ArrowDown className="w-6 h-6 text-emerald-500" />
            <FlowStep 
              icon={<Database />}
              title="Blockchain"
              description="Records creation on immutable ledger"
              step={2}
              mobile
            />
            <ArrowDown className="w-6 h-6 text-emerald-500" />
            <FlowStep 
              icon={<Truck />}
              title="Shipment"
              description="IoT monitored transport"
              step={3}
              mobile
            />
            <ArrowDown className="w-6 h-6 text-emerald-500" />
            <FlowStep 
              icon={<Store />}
              title="Retailer"
              description="Receives & verifies products"
              step={4}
              mobile
            />
            <ArrowDown className="w-6 h-6 text-emerald-500" />
            <FlowStep 
              icon={<Users />}
              title="Customer"
              description="Scans QR to verify authenticity"
              step={5}
              mobile
            />
          </div>
        </div>
      </section>

      {/* User Roles Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-4">Multi-Role Platform</h2>
          <p className="text-slate-600 text-center mb-12 max-w-2xl mx-auto">
            Dedicated portals for each stakeholder with role-specific features
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <RoleCard 
              icon={<Factory />}
              title="Manufacturer"
              color="blue"
              features={[
                "Product Management",
                "Production Batches",
                "B2B Order Processing",
                "IoT Alert Monitoring",
                "Ledger Audit Trail"
              ]}
            />
            <RoleCard 
              icon={<Store />}
              title="Retailer"
              color="purple"
              features={[
                "Inventory Management",
                "Order from Manufacturers",
                "Customer Order Fulfillment",
                "Product Verification",
                "Sales Analytics"
              ]}
            />
            <RoleCard 
              icon={<Users />}
              title="Customer"
              color="emerald"
              features={[
                "Browse Products",
                "QR Code Verification",
                "Order Tracking",
                "Verification History",
                "Report Counterfeits"
              ]}
            />
            <RoleCard 
              icon={<ShieldCheck />}
              title="Admin"
              color="amber"
              features={[
                "System Oversight",
                "User Management",
                "Dispute Resolution",
                "Analytics Dashboard",
                "Platform Settings"
              ]}
            />
          </div>
        </div>
      </section>

      {/* Verification Process */}
      <section className="py-20 px-4 bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-4">Verification Process</h2>
          <p className="text-slate-600 text-center mb-12 max-w-2xl mx-auto">
            Simple three-step process to verify any product's authenticity
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <VerificationStep 
              number={1}
              icon={<QrCode />}
              title="Scan QR Code"
              description="Use your phone camera or our app to scan the product's unique QR code"
            />
            <VerificationStep 
              number={2}
              icon={<Database />}
              title="Check Blockchain"
              description="System queries the blockchain ledger to fetch product history"
            />
            <VerificationStep 
              number={3}
              icon={<CheckCircle />}
              title="Get Results"
              description="Instantly see authenticity status, origin, and complete product journey"
            />
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-4">Technology Stack</h2>
          <p className="text-slate-600 text-center mb-12">
            Built with modern, scalable technologies
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <TechCard 
              layer="Frontend"
              technologies={["React 19", "Vite", "Tailwind CSS", "React Router"]}
              icon={<Globe />}
            />
            <TechCard 
              layer="Backend"
              technologies={["Node.js", "Express 5", "JWT Auth", "REST API"]}
              icon={<Cpu />}
            />
            <TechCard 
              layer="Database"
              technologies={["MySQL 8", "Connection Pooling", "Transactions"]}
              icon={<Database />}
            />
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 px-4 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose BESS-PAS?</h2>
          
          <div className="grid md:grid-cols-4 gap-8">
            <BenefitCard 
              icon={<Zap />}
              title="Fast Verification"
              value="< 2s"
              description="Instant authenticity check"
            />
            <BenefitCard 
              icon={<ShieldCheck />}
              title="Fraud Prevention"
              value="99.9%"
              description="Detection accuracy rate"
            />
            <BenefitCard 
              icon={<Clock />}
              title="Real-time"
              value="24/7"
              description="Continuous monitoring"
            />
            <BenefitCard 
              icon={<Award />}
              title="Trust Score"
              value="100%"
              description="Complete transparency"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-emerald-500 to-teal-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Secure Your Supply Chain?
          </h2>
          <p className="text-emerald-100 text-lg mb-8 max-w-2xl mx-auto">
            Join manufacturers, retailers, and customers who trust BESS-PAS for product authentication
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register" 
              className="bg-white text-emerald-600 hover:bg-emerald-50 px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl"
            >
              Create Free Account
            </Link>
            <Link 
              to="/business" 
              className="bg-emerald-600 text-white hover:bg-emerald-700 border-2 border-white/30 px-8 py-4 rounded-xl font-bold text-lg transition-all"
            >
              Business Solutions
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-emerald-500 p-1.5 rounded-lg">
                  <Lock className="text-white w-4 h-4" />
                </div>
                <span className="font-bold">BESS-PAS</span>
              </div>
              <p className="text-slate-400 text-sm">
                Blockchain-Enhanced Supply Security - Product Authentication System
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/business" className="hover:text-white transition-colors">For Business</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Users</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link to="/register" className="hover:text-white transition-colors">Create Account</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
                <li><Link to="/verify" className="hover:text-white transition-colors">Verify Product</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <p className="text-slate-400 text-sm">
                For support and inquiries, reach out through your dashboard portal.
              </p>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400 text-sm">
            © 2026 BESS-PAS. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

// Component: Feature Card
const FeatureCard = ({ icon, title, description, color }) => {
  const colorClasses = {
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    red: "bg-red-50 text-red-600 border-red-100",
    cyan: "bg-cyan-50 text-cyan-600 border-cyan-100",
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all group">
      <div className={`w-12 h-12 rounded-xl ${colorClasses[color]} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
};

// Component: Flow Step
const FlowStep = ({ icon, title, description, step, mobile = false }) => {
  return (
    <div className={`${mobile ? 'w-full max-w-xs' : 'flex-1'} bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all text-center`}>
      <div className="relative">
        <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-600">
          {React.cloneElement(icon, { className: "w-8 h-8" })}
        </div>
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 text-white rounded-full text-xs font-bold flex items-center justify-center">
          {step}
        </div>
      </div>
      <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-slate-500 text-sm">{description}</p>
    </div>
  );
};

// Component: Flow Arrow
const FlowArrow = () => (
  <div className="hidden lg:flex items-center justify-center flex-shrink-0">
    <ArrowRight className="w-8 h-8 text-emerald-400" />
  </div>
);

// Component: Role Card
const RoleCard = ({ icon, title, color, features }) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    purple: "from-purple-500 to-purple-600",
    emerald: "from-emerald-500 to-emerald-600",
    amber: "from-amber-500 to-amber-600",
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-xl transition-all group">
      <div className={`bg-gradient-to-br ${colorClasses[color]} p-6 text-white`}>
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3">
          {React.cloneElement(icon, { className: "w-6 h-6" })}
        </div>
        <h3 className="text-xl font-bold">{title}</h3>
      </div>
      <div className="p-6">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-3 text-sm text-slate-600">
              <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// Component: Verification Step
const VerificationStep = ({ number, icon, title, description }) => {
  return (
    <div className="text-center">
      <div className="relative inline-block mb-6">
        <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center text-emerald-600 mx-auto">
          {React.cloneElement(icon, { className: "w-10 h-10" })}
        </div>
        <div className="absolute -top-3 -right-3 w-8 h-8 bg-emerald-500 text-white rounded-full font-bold flex items-center justify-center shadow-lg">
          {number}
        </div>
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
};

// Component: Tech Card
const TechCard = ({ layer, technologies, icon }) => {
  return (
    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center text-slate-600">
          {icon}
        </div>
        <h3 className="font-semibold text-slate-900">{layer}</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {technologies.map((tech, index) => (
          <span 
            key={index} 
            className="px-3 py-1 bg-white rounded-lg text-sm text-slate-600 border border-slate-200"
          >
            {tech}
          </span>
        ))}
      </div>
    </div>
  );
};

// Component: Benefit Card
const BenefitCard = ({ icon, title, value, description }) => {
  return (
    <div className="text-center">
      <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-400">
        {React.cloneElement(icon, { className: "w-7 h-7" })}
      </div>
      <div className="text-4xl font-bold text-white mb-2">{value}</div>
      <h3 className="font-semibold text-white mb-1">{title}</h3>
      <p className="text-slate-400 text-sm">{description}</p>
    </div>
  );
};

export default AboutUs;
