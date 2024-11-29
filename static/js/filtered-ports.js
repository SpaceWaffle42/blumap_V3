const open_f = Plot.rectY({ length: 10000 }, Plot.binX({ y: "count" }, { x: Math.random })).plot();
            const filtered_div = document.querySelector("#filtered");
            filtered_div.append(open_f);
