const fs = require('fs');

const aboutHtml = fs.readFileSync('src/app/about-us/about-us.html', 'utf8');
const inquiryHtml = fs.readFileSync('src/app/public-inquiry-form/public-inquiry-form.html', 'utf8');

// Extract nav
const navMatch = aboutHtml.match(/<nav[\s\S]*?<\/nav>/);
const nav = navMatch ? navMatch[0] : '';

// Extract footer
const footerMatch = aboutHtml.match(/<footer[\s\S]*?<\/footer>/);
const footer = footerMatch ? footerMatch[0] : '';

// Process inquiry form
let newInquiryHtml = inquiryHtml;

// Remove the Back to Home block
newInquiryHtml = newInquiryHtml.replace(/<div class="mb-8">[\s\S]*?<\/div>\s*/, '');

// Replace input classes
newInquiryHtml = newInquiryHtml.replace(/class="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50 focus:bg-white transition-colors"/g, 'class="form-control glass-input"');

// Replace the outermost div with the one from about-us to support dark mode transition properly
const wrapperMatch = aboutHtml.match(/<div class="min-h-screen[^>]*>/);
const wrapper = wrapperMatch ? wrapperMatch[0] : '<div class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 font-sans selection:bg-indigo-500 selection:text-white flex flex-col transition-colors duration-300">';

newInquiryHtml = newInquiryHtml.replace(/<div class="min-h-screen[^>]*>/, wrapper + '\n  ' + nav + '\n');

// Add footer before last </div>
const lastDivIndex = newInquiryHtml.lastIndexOf('</div>');
newInquiryHtml = newInquiryHtml.substring(0, lastDivIndex) + '\n  ' + footer + '\n' + newInquiryHtml.substring(lastDivIndex);

fs.writeFileSync('src/app/public-inquiry-form/public-inquiry-form.html', newInquiryHtml);
console.log("Updated public-inquiry-form.html");
