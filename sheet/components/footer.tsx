export default function Footer() {
    return (
        <footer className="flex justify-between items-center px-6 py-4 border-gray-300">
            <div className="text-gray-900">
                © 2022, Made️ by <span className="text-[#9155FD]">ABC</span>
            </div>
            <ul className="flex gap-6 text-[#9155FD]">
                <li className="cursor-pointer">License</li>
                <li className="cursor-pointer">More Themes</li>
                <li className="cursor-pointer">Documentation</li>
                <li className="cursor-pointer">Support</li>
            </ul>
        </footer>
    );
}
