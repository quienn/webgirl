const form = document.getElementById('settings-form');

function readURL(file) {
	return new Promise((res, rej) => {
		const reader = new FileReader();
		reader.onload = e => res(e.target.result);
		reader.onerror = e => rej(e);
		reader.readAsDataURL(file);
	});
};

function Duotone(src, primaryClr, secondaryClr, actions = (ctx) => null) {
	const canvas = document.createElement('canvas');
	canvas.width = 600;
	canvas.height = 600;

	const ctx = canvas.getContext('2d', { willReadFrequently: true });

	const downloadedImg = new Image();
	downloadedImg.crossOrigin = '';
	downloadedImg.onload = function() {
		ctx.drawImage(downloadedImg, 0, 0, canvas.width, canvas.height);
		imageData = ctx.getImageData(0, 0, 800, 800);
		const pixels = imageData.data;
		for (let i = 0; i < pixels.length; i += 4) {
			const red = pixels[i];
			const green = pixels[i + 1];
			const blue = pixels[i + 2];
			const avg = Math.round((0.299 * red + 0.587 * green + 0.114 * blue) * 1);
			pixels[i] = avg;
			pixels[i + 1] = avg;
			pixels[i + 2] = avg;
		}

		ctx.putImageData(imageData, 0, 0);

		ctx.globalCompositeOperation = 'multiply';
		ctx.fillStyle = primaryClr;
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		ctx.globalCompositeOperation = 'lighten';
		ctx.fillStyle = secondaryClr;
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		actions(ctx);
	};

	downloadedImg.src = src;

	return canvas;
}

form.addEventListener('submit', async event => {
	const formButton = document.getElementById('form-button');
	const formFile = document.getElementById('image-file');
	const results = document.getElementById('results');
	const downloadButton = document.getElementById('download-button'); 

	event.preventDefault();
	formButton.textContent = 'doing some magic...';
	formButton.disabled = true;

	const imageFile = formFile.files[0];
	const imageURL = await readURL(imageFile);

	const canvas = Duotone(imageURL, '#F2B705', '#F25C05', (ctx) => {
		const imageData = ctx.getImageData(0, 0, 600, 600);

		for (let i = 0; i < imageData.data.length; i += 4) {
			const random = Math.random() - 0.5;
			imageData.data[i] += (random * 12) + 50;
			imageData.data[i + 1] += (random * 12) + 10;
			imageData.data[i + 2] += (random * 12) + 50;
		}

		ctx.putImageData(imageData, 0, 0);
	});

	downloadButton.hidden = false;

	downloadButton.addEventListener('click', e => {
		const dlink = document.createElement('a');
		dlink.download = 'webgirl-image.png';
		dlink.href = canvas.toDataURL();
		dlink.click();
	});

	results.replaceChildren(canvas);

	formButton.disabled = false;
	formButton.textContent = 'generate';
});
