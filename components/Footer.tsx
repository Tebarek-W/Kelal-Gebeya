import Link from 'next/link'
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
    return (
        <footer className="bg-white dark:bg-neutral-900 border-t border-gray-200 dark:border-neutral-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand & Social */}
                    <div className="space-y-4">
                        <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Kelal Gebeya
                        </Link>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Ethiopia's leading multi-vendor marketplace for unique fashion and lifestyle products.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-purple-600 transition-colors"><Facebook className="w-5 h-5" /></a>
                            <a href="#" className="text-gray-400 hover:text-purple-600 transition-colors"><Twitter className="w-5 h-5" /></a>
                            <a href="#" className="text-gray-400 hover:text-purple-600 transition-colors"><Instagram className="w-5 h-5" /></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white mb-4">Shop</h4>
                        <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                            <li><Link href="/?category=Traditional Clothing" className="hover:text-purple-600 transition-colors">Traditional Clothing</Link></li>
                            <li><Link href="/?category=Modern Fashion" className="hover:text-purple-600 transition-colors">Modern Fashion</Link></li>
                            <li><Link href="/?category=Shoes" className="hover:text-purple-600 transition-colors">Shoes</Link></li>
                            <li><Link href="/?category=Kids & Infants" className="hover:text-purple-600 transition-colors">Kids & Infants</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white mb-4">Support</h4>
                        <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                            <li><Link href="#" className="hover:text-purple-600 transition-colors">Help Center</Link></li>
                            <li><Link href="#" className="hover:text-purple-600 transition-colors">Shipping Info</Link></li>
                            <li><Link href="#" className="hover:text-purple-600 transition-colors">Return Policy</Link></li>
                            <li><Link href="#" className="hover:text-purple-600 transition-colors">Our Vendors</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white mb-4">Contact Us</h4>
                        <div className="flex items-start gap-3 text-sm text-gray-500 dark:text-gray-400">
                            <MapPin className="w-4 h-4 text-purple-600 mt-1" />
                            <span>Addis Ababa, Ethiopia</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                            <Phone className="w-4 h-4 text-purple-600" />
                            <span>+251 911 00 00 00</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                            <Mail className="w-4 h-4 text-purple-600" />
                            <span>support@kelalgebeya.com</span>
                        </div>
                    </div>
                </div>

                <hr className="my-10 border-gray-200 dark:border-neutral-800" />

                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-xs text-gray-500">&copy; 2026 Kelal Gebeya. All rights reserved.</p>
                    <div className="flex items-center gap-6">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Telebirr_Logo.png/800px-Telebirr_Logo.png" alt="Telebirr" className="h-6 opacity-60 grayscale hover:grayscale-0 transition-all cursor-help" title="Telebirr Accepted" />
                        <span className="text-xs font-bold text-gray-400">CASH ON DELIVERY</span>
                        <div className="flex gap-2">
                            <div className="h-6 w-9 rounded-sm bg-neutral-200 dark:bg-neutral-800 animate-pulse"></div>
                            <div className="h-6 w-9 rounded-sm bg-neutral-200 dark:bg-neutral-800 animate-pulse"></div>
                            <div className="h-6 w-9 rounded-sm bg-neutral-200 dark:bg-neutral-800 animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
