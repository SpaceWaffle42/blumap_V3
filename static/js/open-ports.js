const open_p = Plot.rectY({ length: 10000 }, Plot.binX({ y: "count" }, { x: Math.random })).plot();
            const open_div = document.querySelector("#open");
            open_div.append(open_p);
