import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-slate-100">
        <nav className="mx-auto max-w-7xl px-6 lg:px-8" aria-label="Main navigation">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-primary">IntelliAttend</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link to="/features" className="text-sm font-medium text-muted hover:text-primary transition-colors">Features</Link>
              <Link to="/products/smartboard" className="text-sm font-medium text-muted hover:text-primary transition-colors">SmartBoard</Link>
              <Link to="/products/faculty" className="text-sm font-medium text-muted hover:text-primary transition-colors">Faculty</Link>
              <Link to="/products/student" className="text-sm font-medium text-muted hover:text-primary transition-colors">Student</Link>
              <Link to="/pricing" className="text-sm font-medium text-muted hover:text-primary transition-colors">Pricing</Link>
              <Link to="/about" className="text-sm font-medium text-muted hover:text-primary transition-colors">About</Link>
              <Link to="/blog" className="text-sm font-medium text-muted hover:text-primary transition-colors">Blog</Link>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <Link to="/login" className="text-sm font-semibold text-primary hover:text-primary-hover transition-colors">Log in</Link>
              <Link to="/get-started" className="btn-primary w-auto h-10 px-6 text-sm">Get Started</Link>
            </div>
          </div>
        </nav>
      </header>

      <main className="flex-1 pt-16">
        <section className="py-20 lg:py-32">
          <div className="mx-auto max-w-3xl px-6 lg:px-8">
            <h1 className="page-title mb-6">Privacy Policy</h1>
            <p className="text-muted mb-10">Last updated: January 15, 2026</p>

            <div className="prose prose-slate max-w-none space-y-8 text-muted">
              <section>
                <h2 className="font-display text-xl font-semibold text-primary mb-4">1. Introduction</h2>
                <p>IntelliAttend Inc. ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.</p>
              </section>

              <section>
                <h2 className="font-display text-xl font-semibold text-primary mb-4">2. Information We Collect</h2>
                <p>We collect information you provide directly to us, including:</p>
                <ul className="list-disc list-inside space-y-2 mt-4">
                  <li>Account information (name, email, organization, role)</li>
                  <li>Attendance data (check-ins, location, timestamps)</li>
                  <li>Communication data (messages, announcements)</li>
                  <li>Usage analytics and device information</li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-xl font-semibold text-primary mb-4">3. How We Use Your Information</h2>
                <p>We use the information we collect to:</p>
                <ul className="list-disc list-inside space-y-2 mt-4">
                  <li>Provide and improve our services</li>
                  <li>Process attendance and scheduling</li>
                  <li>Send notifications and communications</li>
                  <li>Ensure security and prevent fraud</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-xl font-semibold text-primary mb-4">4. Data Sharing</h2>
                <p>We do not sell your personal information. We may share data with:</p>
                <ul className="list-disc list-inside space-y-2 mt-4">
                  <li>Your educational institution (as the data controller)</li>
                  <li>Service providers who process data on our behalf</li>
                  <li>Legal authorities when required by law</li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-xl font-semibold text-primary mb-4">5. Data Security</h2>
                <p>We implement appropriate technical and organizational measures to protect your data, including encryption, access controls, and regular security assessments.</p>
              </section>

              <section>
                <h2 className="font-display text-xl font-semibold text-primary mb-4">6. Your Rights</h2>
                <p>Depending on your location, you may have rights to access, correct, delete, or restrict processing of your data. Contact us at privacy@intelliattend.com to exercise these rights.</p>
              </section>

              <section>
                <h2 className="font-display text-xl font-semibold text-primary mb-4">7. Contact Us</h2>
                <p>If you have questions about this Privacy Policy, contact us at:</p>
                <address className="not-italic mt-4 text-muted">
                  IntelliAttend Inc.<br />
                  100 Innovation Drive<br />
                  Tech City, CA 94000<br />
                  Email: privacy@intelliattend.com
                </address>
              </section>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-slate-100 pt-20 pb-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2 md:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-6">
                <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <span className="font-display font-bold text-lg text-primary">IntelliAttend</span>
              </Link>
              <p className="text-sm text-muted mb-6 max-w-xs">The intelligent foundation for modern educational institutions.</p>
            </div>
            <div>
              <h4 className="font-semibold text-primary mb-4">Product</h4>
              <ul className="space-y-3">
                <li><Link to="/features" className="text-sm text-muted hover:text-primary transition-colors">Features</Link></li>
                <li><Link to="/get-started" className="text-sm text-muted hover:text-primary transition-colors">Get Started</Link></li>
                <li><Link to="/products/smartboard" className="text-sm text-muted hover:text-primary transition-colors">SmartBoard</Link></li>
                <li><Link to="/products/faculty" className="text-sm text-muted hover:text-primary transition-colors">Faculty</Link></li>
                <li><Link to="/products/student" className="text-sm text-muted hover:text-primary transition-colors">Student</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-primary mb-4">Company</h4>
              <ul className="space-y-3">
                <li><Link to="/about" className="text-sm text-muted hover:text-primary transition-colors">About Us</Link></li>
                <li><Link to="/careers" className="text-sm text-muted hover:text-primary transition-colors">Careers</Link></li>
                <li><Link to="/contact" className="text-sm text-muted hover:text-primary transition-colors">Contact</Link></li>
                <li><Link to="/blog" className="text-sm text-muted hover:text-primary transition-colors">Blog</Link></li>
                <li><Link to="/support" className="text-sm text-muted hover:text-primary transition-colors">Support</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-primary mb-4">Legal</h4>
              <ul className="space-y-3">
                <li><Link to="/privacy" className="text-sm text-muted hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-sm text-muted hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link to="/cookies" className="text-sm text-muted hover:text-primary transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted">© 2026 IntelliAttend Inc. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm text-muted">All systems operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}