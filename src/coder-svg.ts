function addNameSpace (data: string) {
	if (data.indexOf(`http://www.w3.org/2000/svg`) < 0) {
		data = data.replace(/<svg/g, `<svg xmlns="http://www.w3.org/2000/svg"`);
	}

	return data;
}

function encodeSVG (data: string) {
	let outData = addNameSpace(data);
	outData = outData.replace(/'/g, `"`);
	outData = outData.replace(/>\s{1,}</g, `><`);
	outData = outData.replace(/\s{2,}/g, ` `);
	outData = outData.replace(/[\r\n%#()<>?[\\\]^`{|}]/g, encodeURIComponent);
	outData = outData.replace(/ /g, `%20`);

	return outData;
}

function decodeSVG (data: string) {
	const value = data.trim()
		.replace(/background-image:\s{0,}url\(/, ``)
		.replace(/["']{0,}data:image\/svg\+xml,/, ``)
		.replace(/["']\);{0,}$/, ``);

	return decodeURIComponent(value);
}

export { encodeSVG, decodeSVG };
