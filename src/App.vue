<script setup lang="ts">
import { ref , computed} from "vue";
import AceEditor from "ace-editor-vue3";
import { encodeSVG, decodeSVG } from "@/coder-svg";
import ZencodLink from "@/components/ZencodLink.vue";
import "brace/mode/css";
import "brace/theme/dracula";

const optionsEditor = {
	showPrintMargin: false,
	wrap: true,
	useWorker: false,
};
const inputSVG = ref("");
const encodedSVG = computed(() => encodeSVG(inputSVG.value));
const decodedSVG = computed(() => decodeSVG(inputSVG.value));
const backgroundSVG = computed(() => encodedSVG.value && `background-image: url('data:image/svg+xml,${encodedSVG.value}');`);
const isCopySuccess = ref(false);
const isInfoOpen = ref(false);
const tabs = computed(() => [
	{ id: "css", name: "CSS background-image", lang: "css", value: backgroundSVG.value },
	{ id: "encode", name: "SVG Encode", lang: "xml", value: encodedSVG.value },
	{ id: "decode", name: "SVG Decode", lang: "xml", value: decodedSVG.value },
]);
const activeTab = ref(tabs.value[0].id);
const nowTab = computed(() => tabs.value.find(i => i.id === activeTab.value) || tabs.value[0]);

function readFile(e: Event) {
	const el = e.target as HTMLInputElement;
	if (!el.files || !el.files.length) return;

	const reader = new FileReader();
	reader.onload = () => {
		if(typeof reader.result !== "string") return;
		inputSVG.value = reader.result;
	};
	reader.readAsText(el.files[0]);
}

async function copyCB (text: string) {
	try {
		await navigator.clipboard.writeText(text);
		isCopySuccess.value = true;
		setTimeout(() => isCopySuccess.value = false, 3000);
	} catch($e) {
		alert("Cannot copy");
	}
}
</script>

<template>
	<dialog
		class="fixed top-10 max-w-lg z-20 bg-slate-600 text-gray-200"
		:open="isInfoOpen"
	>
		<p>SVG можно использовать в CSS через data URI, но вставку незакодированного SVG поддерживают только браузеры на Webkit. Если закодировать SVG с помощью <code class="text-cyan-400">encodeURIComponent()</code> — SVG начинает отображаться во всех современных браузерах.</p><p>У тега SVG обязательно должен быть атрибут xmlns, вот такой: <b>xmlns='http://www.w3.org/2000/svg'</b>. Если его нет, он будет добавлен автоматически.</p><p>Закодированный SVG можно использовать в <code class="text-cyan-400">background</code>, в <code class="text-cyan-400">border-image</code> или в <code class="text-cyan-400">mask</code>.</p>
		<button
			class="bg-cyan-600 hover:bg-cyan-700 transition-colors px-6 py-1 rounded mt-6"
			@click="isInfoOpen = false"
		>
			OK
		</button>
	</dialog>

	<div class="min-h-screen min-w-full flex justify-center items-center text-gray-400">
		<div class="container mx-auto">
			<div class="flex flex-col">
				<h1 class="text-center text-4xl mb-8 flex flex-row gap-3 items-center justify-center">
					<ZencodLink />
					URL-encoder для SVG
				</h1>
				<div class="flex justify-center mb-20">
					<ul class="flex flex-row">
						<li
							v-for="(tab, tabKey) in tabs"
							:key="tabKey+tab.id"
						>
							<button
								class="font-light py-1 px-6 hover:bg-slate-600 hover:bg-opacity-80"
								:class="{ 'bg-slate-700': tab.id !== activeTab, 'bg-slate-600': tab.id === activeTab, 'pointer-events-none': tab.id === activeTab, 'rounded-l': tabKey === 0, 'rounded-r': tabKey === tabs.length-1 }"
								@click="activeTab = tab.id"
							>
								{{ tab.name }}
							</button>
						</li>
					</ul>
				</div>
				<div class="flex flex-row gap-8">
					<div class="relative w-full">
						<h2 class="mb-4 text-xl font-light">
							Вставьте код SVG:
						</h2>
						<AceEditor
							v-model:codeContent="inputSVG"
							:options="optionsEditor"
							theme="dracula"
							lang="html"
							width="100%"
							height="300px"
						/>
						<label
							class="absolute bottom-1 left-1 cursor-pointer z-10"
						>
							<svg
								class="h-8 w-8 text-cyan-500 hover:text-cyan-700"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								stroke-width="2"
								stroke="currentColor"
								fill="none"
								stroke-linecap="round"
								stroke-linejoin="round"
							>  <path
								stroke="none"
								d="M0 0h24v24H0z"
							/>  <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" />  <polyline points="7 9 12 4 17 9" />  <line
								x1="12"
								y1="4"
								x2="12"
								y2="16"
							/></svg>
							<input
								type="file"
								class="hidden"
								@change="readFile"
							>
						</label>
					</div>
					<div class="relative w-full">
						<h2 class="mb-4 text-xl font-light">
							{{ nowTab.name }}:
						</h2>
						<div
							v-if="isCopySuccess"
							class="absolute bottom-1 left-1 z-10 pointer-events-none"
						>
							<svg
								class="h-8 w-8 text-gray-600"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								stroke-width="2"
								stroke="currentColor"
								fill="none"
								stroke-linecap="round"
								stroke-linejoin="round"
							>  <path
								stroke="none"
								d="M0 0h24v24H0z"
							/>  <polyline points="9 11 12 14 20 6" />  <path d="M20 12v6a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h9" /></svg>
						</div>
						<button
							v-else
							class="absolute bottom-1 left-1 z-10"
							@click="copyCB(nowTab.value)"
						>
							<svg
								class="h-8 w-8 text-cyan-500 hover:text-cyan-700"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								stroke-width="2"
								stroke="currentColor"
								fill="none"
								stroke-linecap="round"
								stroke-linejoin="round"
							>  <path
								stroke="none"
								d="M0 0h24v24H0z"
							/>  <rect
								x="8"
								y="8"
								width="12"
								height="12"
								rx="2"
							/>  <path d="M16 8v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h2" /></svg>
						</button>
						<AceEditor
							v-model:codeContent="nowTab.value"
							:options="{ ...optionsEditor, setReadOnly: true}"
							theme="dracula"
							:lang="nowTab.lang"
							width="100%"
							height="300px"
							disabled
						/>
					</div>
				</div>
			</div>
			<div class="my-10 flex gap-3 justify-end">
				<button
					class="text-gray-500 hover:text-gray-600"
					@click="isInfoOpen = true"
				>
					<svg
						class="h-6 w-6"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>  <circle
						cx="12"
						cy="12"
						r="10"
					/>  <line
						x1="12"
						y1="16"
						x2="12"
						y2="12"
					/>  <line
						x1="12"
						y1="8"
						x2="12.01"
						y2="8"
					/></svg>
				</button>
				<a
					href="https://github.com/alexsoin/url-encoder-svg-vue/"
					class="text-gray-400 hover:text-gray-500"
					target="_blank"
					title="репозиторий проекта"
				>
					<svg
						class="h-6 w-6"
						viewBox="0 0 32 32"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							fill-rule="evenodd"
							clip-rule="evenodd"
							d="M16 0C7.16 0 0 7.16 0 16C0 23.08 4.58 29.06 10.94 31.18C11.74 31.32 12.04 30.84 12.04 30.42C12.04 30.04 12.02 28.78 12.02 27.44C8 28.18 6.96 26.46 6.64 25.56C6.46 25.1 5.68 23.68 5 23.3C4.44 23 3.64 22.26 4.98 22.24C6.24 22.22 7.14 23.4 7.44 23.88C8.88 26.3 11.18 25.62 12.1 25.2C12.24 24.16 12.66 23.46 13.12 23.06C9.56 22.66 5.84 21.28 5.84 15.16C5.84 13.42 6.46 11.98 7.48 10.86C7.32 10.46 6.76 8.82 7.64 6.62C7.64 6.62 8.98 6.2 12.04 8.26C13.32 7.9 14.68 7.72 16.04 7.72C17.4 7.72 18.76 7.9 20.04 8.26C23.1 6.18 24.44 6.62 24.44 6.62C25.32 8.82 24.76 10.46 24.6 10.86C25.62 11.98 26.24 13.4 26.24 15.16C26.24 21.3 22.5 22.66 18.94 23.06C19.52 23.56 20.02 24.52 20.02 26.02C20.02 28.16 20 29.88 20 30.42C20 30.84 20.3 31.34 21.1 31.18C27.42 29.06 32 23.06 32 16C32 7.16 24.84 0 16 0V0Z"
							fill="currentColor"
						/>
					</svg>
				</a>
			</div>
		</div>
	</div>
</template>
