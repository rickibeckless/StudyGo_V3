export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer id="main-footer">
            <nav id="footer-navbar">
                <ul>
                    <li><a href="#">About</a></li>
                    <li><a href="#">Terms of Service</a></li>
                    <li><a href="#">Privacy Policy</a></li>
                    <li><a href="#">Help</a></li>
                    <li><a href="#">Contact</a></li>
                </ul>
            </nav>
            <p id="footer-cr-statement">
                Copyright &copy; {year} <a id="footer-cr-link" href="https://github.com/rickibeckless" target="_blank" rel="noopener nofollow noreferrer" title="Ricki Beckless GitHub">Ricki Beckless</a>. All rights reserved.
            </p>
        </footer>
    )
}