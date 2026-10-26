import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

export default function TermsPage() {
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
            <h1 className="page-title mb-6">Terms of Service</h1>
            <p className="text-muted mb-10">Last updated: January 15, 2026</p>

            <div className="prose prose-slate max-w-none space-y-8 text-muted">
              <section>
                <h2 className="font-display text-xl font-semibold text-primary mb-4">1. Acceptance of Terms</h2>
                <p>By accessing and using IntelliAttend, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use this service.</p>
              </section>

              <section>
                <h2 className="font-display text-xl font-semibold text-primary mb-4">2. Description of Service</h2>
                <p>IntelliAttend provides an AI-powered campus management platform including attendance tracking, scheduling, communication, analytics, and related services for educational institutions.</p>
              </section>

              <section>
                <h2 className="font-display text-xl font-semibold text-primary mb-4">3. User Accounts</h2>
                <p>You must provide accurate and complete registration information. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</p>
              </section>

              <section>
                <h2 className="font-display text-xl font-semibold text-primary mb-4">4. Acceptable Use</h2>
                <p>You agree not to use the service for any unlawful purpose or in any way that could damage, disable, overburden, or impair our servers or networks.</p>
              </section>

              <section>
                <h2 className="font-display text-xl font-semibold text-primary mb-4">5. Intellectual Property</h2>
                <p>All content, features, and functionality of the service are owned by IntelliAttend and are protected by international copyright, trademark, and other intellectual property laws.</p>
              </section>

              <section>
                <h2 className="font-display text-xl font-semibold text-primary mb-4">6. Subscriptions and Billing</h2>
                <p>Paid plans are billed in advance on a monthly or annual basis. Refunds are not provided for partial months. You may cancel at any time, and your service will continue until the end of the billing period.</p>
              </section>

              <section>
                <h2 className="font-display text-xl font-semibold text-primary mb-4">7. Data and Privacy</h2>
                <p>Your use of the service is also governed by our Privacy Policy. You retain ownership of your data. We do not claim ownership of content you submit.</p>
              </section>

              <section>
                <h2 className="font-display text-xl font-semibold text-primary mb-4">8. Disclaimer of Warranties</h2>
                <p>The service is provided "as is" and "as available" without warranties of any kind, either express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, or non-infringement.</p>
              </section>

              <section>
                <h2 className="font-display text-xl font-semibold text-primary mb-4">9. Limitation of Liability</h2>
                <p>In no event shall IntelliAttend be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or use, arising out of or related to your use of the service.</p>
              </section>

              <section>
                <h2 className="font-display text-xl font-semibold text-primary mb-4">10. Termination</h2>
                <p>We may terminate or suspend your account immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users or us.</p>
              </section>

              <section>
                <h2 className="font-display text-xl font-semibold text-primary mb-4">11. Governing Law</h2>
                <p>These Terms shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law provisions.</p>
              </section>

              <section>
                <h2 className="font-display text-xl font-semibold text-primary mb-4">12. Contact Us</h2>
                <p>If you have questions about these Terms, contact us at:</p>
                <address className="not-italic mt-4 text-muted">
                  IntelliAttend Inc.<br />
                  100 Innovation Drive<br />
                  Tech City, CA 94000<br />
                  Email: legal@intelliattend.com
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