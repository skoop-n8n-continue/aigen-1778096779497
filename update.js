const fs = require('fs');
let code = fs.readFileSync('script.js', 'utf8');

const newIconLogic = `
function getWeatherIconUrl(weathercode) {
    let iconName = 'cloud'; // Default

    switch (weathercode) {
        case 0: iconName = 'sun'; break;
        case 1:
        case 2: iconName = 'cloud-sun'; break;
        case 3: iconName = 'cloud'; break;
        case 45:
        case 48: iconName = 'wind'; break;
        case 51:
        case 53:
        case 55:
        case 56:
        case 57: iconName = 'cloud-drizzle'; break;
        case 61:
        case 63:
        case 65:
        case 66:
        case 67:
        case 80:
        case 81:
        case 82: iconName = 'cloud-rain'; break;
        case 71:
        case 73:
        case 75:
        case 85:
        case 86: iconName = 'cloud-snow'; break;
        case 77: iconName = 'snowflake'; break;
        case 95:
        case 96:
        case 99: iconName = 'cloud-lightning'; break;
        default: iconName = 'cloud';
    }

    return \`https://unpkg.com/lucide-static@latest/icons/\${iconName}.svg\`;
}
`;

code = code.replace(/function getWeatherIconUrl\(weathercode\) \{[\s\S]*?return `\$\{meteoconsBaseUrl\}\$\{iconName\}\.svg`;\n\}/, newIconLogic.trim());

fs.writeFileSync('script.js', code);
