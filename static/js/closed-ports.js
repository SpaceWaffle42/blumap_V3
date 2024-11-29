const closed_p = Plot.rectY({ length: 10000 }, Plot.binX({ y: "count" }, { x: Math.random })).plot();
            const closed_div = document.querySelector("#closed");
            closed_div.append(closed_p);