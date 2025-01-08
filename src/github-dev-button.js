{
	/** @param {Element} ul */
	const addDevButton = (ul) => {
		const BTN_ID = "github-vscode-button";
		if (ul.querySelector(`#${BTN_ID}`)) return;

		// * ---------------- create button
		const li = document.createElement("li");
		li.id = BTN_ID;

		{
			const a = document.createElement("a");
			a.classList.add("btn", "btn-sm");
			a.textContent = "vs.dev";
			a.href = `https://vscode.dev/github/${document.location.pathname.slice(1)}`;
			li.append(a);
		}
		{
			const a = document.createElement("a");
			a.classList.add("btn", "btn-sm");
			a.textContent = "gh.dev";
			a.href = `https://github.dev/${document.location.pathname.slice(1)}`;
			li.append(a);
		}

		ul.prepend(li);
	};

	domObserverAll(".pagehead-actions", (ul) => {
		addDevButton(ul);
	});
}
