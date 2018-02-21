import KeyPaging from '../features/KeyPaging.js';
import CellClick from '../features/CellClick.js';
import CellSelection from '../features/CellSelection.js';
import ThumbwheelScrolling from '../features/ThumbwheelScrolling.js';
import ColumnSorting from '../features/ColumnSorting.js';
import OnHover from '../features/OnHover.js';
import ColumnAutosizing from '../features/ColumnAutosizing.js';
import CellProvider from '../CellProvider.js';
import Rectangles from '../Rectangles.js';

const noop = function() {};

const imageCache = {};


// create these images with http://www.base64-image.de/
const imgData = [
	['1-abs-down', 'iVBORw0KGgoAAAANSUhEUgAAAA4AAAAKCAYAAACE2W/HAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAAOwgAADsIBFShKgAAAABh0RVh0U29mdHdhcmUAcGFpbnQubmV0IDQuMC41ZYUyZQAAAFFJREFUKFNjQAL/oTTD////CWJkgFMjEAgD8Q4gLkMSgwOsGoGgDCQExcRrRFJImo1ICqmnEUSiYJgkMgYCrDYia8TQBFVIJ6cCAXJ0QDGDDQD67OYX9wdp0wAAAABJRU5ErkJggg=='],
	['1-abs-up', 'iVBORw0KGgoAAAANSUhEUgAAAA4AAAAKCAYAAACE2W/HAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAAOwgAADsIBFShKgAAAABh0RVh0U29mdHdhcmUAcGFpbnQubmV0IDQuMC41ZYUyZQAAAExJREFUKFPtjYEJACAIBN2hdZqr2dqu3tB8C5qghzPxlAQZJ4iWJ9E8DpACOmh7ZkLLwoWDNPJxSMONSwa5fzSBJy8z/9B6RpfVZaRO2oo/zJVRDvIAAAAASUVORK5CYII='],
	['1-down', 'iVBORw0KGgoAAAANSUhEUgAAAA4AAAAKCAYAAACE2W/HAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAAOwgAADsIBFShKgAAAABh0RVh0U29mdHdhcmUAcGFpbnQubmV0IDQuMC41ZYUyZQAAAGtJREFUKFOtjoEJgDAQA6uiC7iOc3U2t3sT6Uu+XxDBwFliEtoisnYWM3vFtQG6mWZQ2sEJqvy7tQC6FUzdqLaMpCH1OB1KcXgjBZ8HDhSHEuCIZeW/IcRvwEMFyjey7HjQA317KsvMIuW4AFTUEgvs+3wkAAAAAElFTkSuQmCC'],
	['1-up', 'iVBORw0KGgoAAAANSUhEUgAAAA4AAAAKCAYAAACE2W/HAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAadEVYdFNvZnR3YXJlAFBhaW50Lk5FVCB2My41LjExR/NCNwAAAFBJREFUKFPtjdsNQCEIQ93BdZzL2dwOjw9CuV93AEmOJbYNxcw2DHL2P5wHcdR0mAoDuvxFyXHzBrp4UZQAEoUvTL4oBpLDyiveXVnh5WVKm6iPR8RbHxLhAAAAAElFTkSuQmCC'],

	['2-abs-down', 'iVBORw0KGgoAAAANSUhEUgAAAA4AAAAKCAYAAACE2W/HAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAAOwgAADsIBFShKgAAAABh0RVh0U29mdHdhcmUAcGFpbnQubmV0IDQuMC41ZYUyZQAAAH5JREFUKFOVkAsNgDAMROcBBxjAAEJwgAMcYGGmsIAGLJS7piE3FjJ2yRvpxus+SWLxTWbWRFOJyAgyuDgNDjD9EWewAzZgvElTVCJshLJfXED3jjwu77pG7UKBCvHTAPgwWeY8Kn5KLN4i81SyyOOdgHfzqMixQBb9FWvSdgNN871AHwblVAAAAABJRU5ErkJggg=='],
	['2-abs-up', 'iVBORw0KGgoAAAANSUhEUgAAAA4AAAAKCAYAAACE2W/HAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAAOwgAADsIBFShKgAAAABh0RVh0U29mdHdhcmUAcGFpbnQubmV0IDQuMC41ZYUyZQAAAJVJREFUKFN9kAEVgzAMRPEwBzOAgQnBwRzgYBZqCgtowAL7l6VtILB77zc01yttB7SfQRr+0j8uAugJBTb5sMBoni/QYNSQ91/wAW0g2Sbu9VAlhisubcSUeTCscYdrgt8fg0HJgQrScXXXt82DQckBgR6ghymtF0zKMSBQC2nS+mEBJYV0vBV0N1PzwiJKCtorZob5Cy2RFvXFQAKlAAAAAElFTkSuQmCC'],
	['2-down', 'iVBORw0KGgoAAAANSUhEUgAAAA4AAAAKCAYAAACE2W/HAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAAOwgAADsIBFShKgAAAABh0RVh0U29mdHdhcmUAcGFpbnQubmV0IDQuMC41ZYUyZQAAAJtJREFUKFOFkAsNAjEQRAsXMIADDJwBhOAABzjAwpnCAhqwUN4s2zJQCJO8bGa3018x1ayl1vqXpi3IrWVsuIcF7mrDFWYPTiC3gZUFD3ABbSDFJh6UumtBJ6WNsB/BtugbqSM8T7QBZQw0kK6rt57C24AyBgTagT5msV687Y02zAU9JNP7OfwV0vVuoLeF+swWUV6h7MUvjpTzA6fM6SVV2CbgAAAAAElFTkSuQmCC'],
	['2-up', 'iVBORw0KGgoAAAANSUhEUgAAAA4AAAAKCAYAAACE2W/HAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAadEVYdFNvZnR3YXJlAFBhaW50Lk5FVCB2My41LjExR/NCNwAAAIxJREFUKFOVkFsRgDAMBOsBBxjAAEJwgAMcYAFTWEADFspe+iDQH8jMcrSX6yvEGA0KSf9fSB+k8DBD6GGDUx7sMGTvDhVccIQVtIDKFjHPNSH3bm9yaSGG/4MT/N5Rx9VdZxs7A2kDgupAD7PVOWciz4CgakiDOu8akCak4x2gu1lVzzUhTdBesSUsF/uHHu110bZRAAAAAElFTkSuQmCC'],

	['3-abs-down', 'iVBORw0KGgoAAAANSUhEUgAAAA4AAAAKCAYAAACE2W/HAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAAOwgAADsIBFShKgAAAABh0RVh0U29mdHdhcmUAcGFpbnQubmV0IDQuMC41ZYUyZQAAAJVJREFUKFONkQENhDAMRecBB2cAAyhAwTnAAQ6wgAa8nIXTcBbGf6NduiyEe8ljadlfOkiBbGvKOT8a6YLiJXf5oy2/8v1PcJKb5ABYJS+8LnTBqMFBFGOpjKfgIBl7t7pyGxQ+InecPcizMYZ8kzFLGnXUGLwLOTS5a6XuCqFFMib3A2p+Tfmq7GgMQU4+vC8/Vy+lEzGdowwHiWM2AAAAAElFTkSuQmCC'],
	['3-abs-up', 'iVBORw0KGgoAAAANSUhEUgAAAA4AAAAKCAYAAACE2W/HAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAAOwgAADsIBFShKgAAAABh0RVh0U29mdHdhcmUAcGFpbnQubmV0IDQuMC41ZYUyZQAAAJtJREFUKFOFkQERwjAMResBBzOAgSmYAhzgAAdYmAa8YAENWID3SgM5soN/95om6e+lW0OPb5DLTz6bDQOaYIW7fbjBoffGAZdOmEZ9hjN4gTqBjZ6/TUE2B0NeZLLPDUI1BGgHjr32PDUI1SAoRvSNS6+lJqGaJGkBC/9H3ZDFOR8gFNMRHNP3KXN/zZQPEYrRr3ixN7i+aq09ARE7/LLO8L26AAAAAElFTkSuQmCC'],
	['3-down', 'iVBORw0KGgoAAAANSUhEUgAAAA4AAAAKCAYAAACE2W/HAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAAOwgAADsIBFShKgAAAABh0RVh0U29mdHdhcmUAcGFpbnQubmV0IDQuMC41ZYUyZQAAAKdJREFUKFN1kQERwjAMRQscGMDBDGBgCqYABzjAARamAS9YQAMWyn8hodlt/Xfv0p80uXQrSdXjX7XWLqGTwO3NNQ1iFh9B/S2uufEgcEexI+EaxUMwAN0F98Kb2hjXxmoMwlzMuVRfviMjnQVrz+ZTQWHdAFKsyBsny6WiwroJkiZBwlblsKDTFCI5RrHXdBOsyfsQnl8z5EsKrclzfMUnNef1y5XyBYgdtwl+Lm+LAAAAAElFTkSuQmCC'],
	['3-up', 'iVBORw0KGgoAAAANSUhEUgAAAA4AAAAKCAYAAACE2W/HAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAadEVYdFNvZnR3YXJlAFBhaW50Lk5FVCB2My41LjExR/NCNwAAAJpJREFUKFONkQsRwjAQBeMBBzWAgSqoAhzgAAdYqAa8YAENWAi7+cAx6UDfzPaae32ZS5pyzgVEqe97qA9K58tMaYIVnnrwgFPzPqFOCM5wBTdQF9CY4u7vwBZNbuTiGA3KGOigAzj2WtbBoIwBQX1Ez7iUXjApY0iCFrDxf9QN2ZzjB5QhdAbH9HzKtb/m960ib/Gm17jXXkov3zEEuQ7h10oAAAAASUVORK5CYII='],

	['back', 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAD8GlDQ1BJQ0MgUHJvZmlsZQAAOI2NVd1v21QUP4lvXKQWP6Cxjg4Vi69VU1u5GxqtxgZJk6XpQhq5zdgqpMl1bhpT1za2021Vn/YCbwz4A4CyBx6QeEIaDMT2su0BtElTQRXVJKQ9dNpAaJP2gqpwrq9Tu13GuJGvfznndz7v0TVAx1ea45hJGWDe8l01n5GPn5iWO1YhCc9BJ/RAp6Z7TrpcLgIuxoVH1sNfIcHeNwfa6/9zdVappwMknkJsVz19HvFpgJSpO64PIN5G+fAp30Hc8TziHS4miFhheJbjLMMzHB8POFPqKGKWi6TXtSriJcT9MzH5bAzzHIK1I08t6hq6zHpRdu2aYdJYuk9Q/881bzZa8Xrx6fLmJo/iu4/VXnfH1BB/rmu5ScQvI77m+BkmfxXxvcZcJY14L0DymZp7pML5yTcW61PvIN6JuGr4halQvmjNlCa4bXJ5zj6qhpxrujeKPYMXEd+q00KR5yNAlWZzrF+Ie+uNsdC/MO4tTOZafhbroyXuR3Df08bLiHsQf+ja6gTPWVimZl7l/oUrjl8OcxDWLbNU5D6JRL2gxkDu16fGuC054OMhclsyXTOOFEL+kmMGs4i5kfNuQ62EnBuam8tzP+Q+tSqhz9SuqpZlvR1EfBiOJTSgYMMM7jpYsAEyqJCHDL4dcFFTAwNMlFDUUpQYiadhDmXteeWAw3HEmA2s15k1RmnP4RHuhBybdBOF7MfnICmSQ2SYjIBM3iRvkcMki9IRcnDTthyLz2Ld2fTzPjTQK+Mdg8y5nkZfFO+se9LQr3/09xZr+5GcaSufeAfAww60mAPx+q8u/bAr8rFCLrx7s+vqEkw8qb+p26n11Aruq6m1iJH6PbWGv1VIY25mkNE8PkaQhxfLIF7DZXx80HD/A3l2jLclYs061xNpWCfoB6WHJTjbH0mV35Q/lRXlC+W8cndbl9t2SfhU+Fb4UfhO+F74GWThknBZ+Em4InwjXIyd1ePnY/Psg3pb1TJNu15TMKWMtFt6ScpKL0ivSMXIn9QtDUlj0h7U7N48t3i8eC0GnMC91dX2sTivgloDTgUVeEGHLTizbf5Da9JLhkhh29QOs1luMcScmBXTIIt7xRFxSBxnuJWfuAd1I7jntkyd/pgKaIwVr3MgmDo2q8x6IdB5QH162mcX7ajtnHGN2bov71OU1+U0fqqoXLD0wX5ZM005UHmySz3qLtDqILDvIL+iH6jB9y2x83ok898GOPQX3lk3Itl0A+BrD6D7tUjWh3fis58BXDigN9yF8M5PJH4B8Gr79/F/XRm8m241mw/wvur4BGDj42bzn+Vmc+NL9L8GcMn8F1kAcXgSteGGAAABUUlEQVQ4EWNgGLQgZY12e9oa/S/YHIgsx4JNQdwirXaG/4zljEyMjOjy6HJM6ArCJmr0CQjyVBgr2DH++fMXRRqbHIoLfOpU5nELMyfKCasy/Pv/h+H3d4QBuOTgLnDIkl/CI8aSqCCtyPDmywuGb78+Mfz6+g/sAnxyYBdYREs/4pNklRVX4Gd49u4Jw////xk4WTkZfn35x4BPDmQ62AW/f/y/+Pvbf4YfP38y/Prxh+HX9z8MX359ZvgJdAE+ObgBZ98+C3xx7dva+8c/MTCzMTL8+/ef4fvPbww/P/1hwCcHN4DhAMOf8xufh7y8/m3Vw2NfGFjYmRi+//gBDMT/DHjlgCagxMLFrS/C9f5I/Pz393+srCk3PBBBNuGSQzEApPDSzhdxmn8k/v37yxD/+wckFkDiIIBPDqICidR0EJ2t7y0J9AMmwCeHqZrWIgAZ4PYDxftGYgAAAABJRU5ErkJggg=='],
	['expand', 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAAOwgAADsIBFShKgAAAABh0RVh0U29mdHdhcmUAcGFpbnQubmV0IDQuMC41ZYUyZQAAAQ9JREFUOE9jcIoq/Y+MgYCBFAw2AMahmQEK7UL/kTGyHFFeAGkKOmoLxhgGIHNwYZCm0JMOYIzVACCAC2JzEUhTxFlnMCboAmRvIBsQc8kNjPG6AETjMiD+micYE+UCZAwSA2lKvuUDxnhdgIwLNqWDFcNw+n1/MEYWK9iYjqoJhGE2O8QU/FdplPsfesL+f9bjIBQMErOaqgtUjuYCEA1zNghbpyT815wgBbY570Xo/9znof/T7vn/V++X+N93sB2iB6YYhpENALFBCs2XqP0veB0OxiA2TDMIo2gGYZgXYBgkFrjQ7X/AAWsIXuAKFoNhFM34sN5Ehf8g/Pj9QyAXIY6iCB8GORvZ6RD8nwEA/ZSbmLCRhEoAAAAASUVORK5CYII='],
	['forth', 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAB3RJTUUH1wkbCxU7wwzUCQAAAAlwSFlzAAAewQAAHsEBw2lUUwAAAARnQU1BAACxjwv8YQUAAACcUExURQAAADhUH3CvOHa3O2igNDZRHl2OLzhUHztYIFF7Kj5dIUBgIkNlJEhtJXi4Pna2Oz1cIUNlJEhtJk94KVF8KlN/K1SBK1WCLFaELVqJLlyOL1+SMGOYMmmiNGmjNG+sN2+tN3GvOHKwOHKxOXOzOXS0OnS1OnW2O3e3PXi4Pn28RH+9RoC+R4bCUInDVJHHXpvMa5zNbqTReabSfVhfgkQAAAAQdFJOUwAEh4eOm56goqSprLPi9P64yPeoAAAAZklEQVQY043FRwKCMAAAwUVAqVYUpAjYY6P9/29eAuSmcxn4ba6rAWIxUQIu3dMYA/K2OU6HgEP9qTK7D0iru3glvgyI3+VJ7D0ZsHsUt8jVZMDmeg6dIWBdbq0xYBXMlIClqfaHL3HSC6GZKibEAAAAAElFTkSuQmCC'],
	['up', 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAD8GlDQ1BJQ0MgUHJvZmlsZQAAOI2NVd1v21QUP4lvXKQWP6Cxjg4Vi69VU1u5GxqtxgZJk6XpQhq5zdgqpMl1bhpT1za2021Vn/YCbwz4A4CyBx6QeEIaDMT2su0BtElTQRXVJKQ9dNpAaJP2gqpwrq9Tu13GuJGvfznndz7v0TVAx1ea45hJGWDe8l01n5GPn5iWO1YhCc9BJ/RAp6Z7TrpcLgIuxoVH1sNfIcHeNwfa6/9zdVappwMknkJsVz19HvFpgJSpO64PIN5G+fAp30Hc8TziHS4miFhheJbjLMMzHB8POFPqKGKWi6TXtSriJcT9MzH5bAzzHIK1I08t6hq6zHpRdu2aYdJYuk9Q/881bzZa8Xrx6fLmJo/iu4/VXnfH1BB/rmu5ScQvI77m+BkmfxXxvcZcJY14L0DymZp7pML5yTcW61PvIN6JuGr4halQvmjNlCa4bXJ5zj6qhpxrujeKPYMXEd+q00KR5yNAlWZzrF+Ie+uNsdC/MO4tTOZafhbroyXuR3Df08bLiHsQf+ja6gTPWVimZl7l/oUrjl8OcxDWLbNU5D6JRL2gxkDu16fGuC054OMhclsyXTOOFEL+kmMGs4i5kfNuQ62EnBuam8tzP+Q+tSqhz9SuqpZlvR1EfBiOJTSgYMMM7jpYsAEyqJCHDL4dcFFTAwNMlFDUUpQYiadhDmXteeWAw3HEmA2s15k1RmnP4RHuhBybdBOF7MfnICmSQ2SYjIBM3iRvkcMki9IRcnDTthyLz2Ld2fTzPjTQK+Mdg8y5nkZfFO+se9LQr3/09xZr+5GcaSufeAfAww60mAPx+q8u/bAr8rFCLrx7s+vqEkw8qb+p26n11Aruq6m1iJH6PbWGv1VIY25mkNE8PkaQhxfLIF7DZXx80HD/A3l2jLclYs061xNpWCfoB6WHJTjbH0mV35Q/lRXlC+W8cndbl9t2SfhU+Fb4UfhO+F74GWThknBZ+Em4InwjXIyd1ePnY/Psg3pb1TJNu15TMKWMtFt6ScpKL0ivSMXIn9QtDUlj0h7U7N48t3i8eC0GnMC91dX2sTivgloDTgUVeEGHLTizbf5Da9JLhkhh29QOs1luMcScmBXTIIt7xRFxSBxnuJWfuAd1I7jntkyd/pgKaIwVr3MgmDo2q8x6IdB5QH162mcX7ajtnHGN2bov71OU1+U0fqqoXLD0wX5ZM005UHmySz3qLtDqILDvIL+iH6jB9y2x83ok898GOPQX3lk3Itl0A+BrD6D7tUjWh3fis58BXDigN9yF8M5PJH4B8Gr79/F/XRm8m241mw/wvur4BGDj42bzn+Vmc+NL9L8GcMn8F1kAcXgSteGGAAABVUlEQVQ4EWNgoDWouVD5H58dTPgkHU7o/D/9YzM+JbjldLdI/T/6f8r/Bf8T/quvlsLpCkZsRqgtlPo/La6K4dSfLQzfv/1k4ORiZ1iw7BLDrfhnGOoxBCCaC4GajzF8+PYBbj47kLVy+Q2GWxnPUfSghIHhQlWgzYUMTxjuAm2GaP4PdAEI/wDi8EgNBu0Z8ijegZtmsdD4/8vvtxlYuVgZFNWEGOyNdcAuAGn+DrT9yPL7DO+/fwW7SJBTluFC0VWwXhaYG0/En4Ubxr2a57+yuSbD4W8HwNKcQPLL918MD6s/gdU8ZLgK08aA4gW46LffDN9/A+39+hOMQS5ghUuiMrAbAFbzneEHkAZhkEG/wAywBAqB1YBf3/8DAxGHDhTtDAzwMEAWZ+NkZPjO/YOBA+R2EACGHRsHhIlOYjXg8akvDBPvbGP4BTTgP8wQdJ2Dhg8A9SSD4ETIHK4AAAAASUVORK5CYII='],
	['down', 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAD8GlDQ1BJQ0MgUHJvZmlsZQAAOI2NVd1v21QUP4lvXKQWP6Cxjg4Vi69VU1u5GxqtxgZJk6XpQhq5zdgqpMl1bhpT1za2021Vn/YCbwz4A4CyBx6QeEIaDMT2su0BtElTQRXVJKQ9dNpAaJP2gqpwrq9Tu13GuJGvfznndz7v0TVAx1ea45hJGWDe8l01n5GPn5iWO1YhCc9BJ/RAp6Z7TrpcLgIuxoVH1sNfIcHeNwfa6/9zdVappwMknkJsVz19HvFpgJSpO64PIN5G+fAp30Hc8TziHS4miFhheJbjLMMzHB8POFPqKGKWi6TXtSriJcT9MzH5bAzzHIK1I08t6hq6zHpRdu2aYdJYuk9Q/881bzZa8Xrx6fLmJo/iu4/VXnfH1BB/rmu5ScQvI77m+BkmfxXxvcZcJY14L0DymZp7pML5yTcW61PvIN6JuGr4halQvmjNlCa4bXJ5zj6qhpxrujeKPYMXEd+q00KR5yNAlWZzrF+Ie+uNsdC/MO4tTOZafhbroyXuR3Df08bLiHsQf+ja6gTPWVimZl7l/oUrjl8OcxDWLbNU5D6JRL2gxkDu16fGuC054OMhclsyXTOOFEL+kmMGs4i5kfNuQ62EnBuam8tzP+Q+tSqhz9SuqpZlvR1EfBiOJTSgYMMM7jpYsAEyqJCHDL4dcFFTAwNMlFDUUpQYiadhDmXteeWAw3HEmA2s15k1RmnP4RHuhBybdBOF7MfnICmSQ2SYjIBM3iRvkcMki9IRcnDTthyLz2Ld2fTzPjTQK+Mdg8y5nkZfFO+se9LQr3/09xZr+5GcaSufeAfAww60mAPx+q8u/bAr8rFCLrx7s+vqEkw8qb+p26n11Aruq6m1iJH6PbWGv1VIY25mkNE8PkaQhxfLIF7DZXx80HD/A3l2jLclYs061xNpWCfoB6WHJTjbH0mV35Q/lRXlC+W8cndbl9t2SfhU+Fb4UfhO+F74GWThknBZ+Em4InwjXIyd1ePnY/Psg3pb1TJNu15TMKWMtFt6ScpKL0ivSMXIn9QtDUlj0h7U7N48t3i8eC0GnMC91dX2sTivgloDTgUVeEGHLTizbf5Da9JLhkhh29QOs1luMcScmBXTIIt7xRFxSBxnuJWfuAd1I7jntkyd/pgKaIwVr3MgmDo2q8x6IdB5QH162mcX7ajtnHGN2bov71OU1+U0fqqoXLD0wX5ZM005UHmySz3qLtDqILDvIL+iH6jB9y2x83ok898GOPQX3lk3Itl0A+BrD6D7tUjWh3fis58BXDigN9yF8M5PJH4B8Gr79/F/XRm8m241mw/wvur4BGDj42bzn+Vmc+NL9L8GcMn8F1kAcXgSteGGAAABV0lEQVQ4EWNgGGjAiM0BItl8/7mFGBh+fWdg+A/EMPBi6icM9SwwSWRa1oyHITbKjuHem9sQ4a8MDHtXPmB4gawIysZqwK/v/xk4v3Iw/ABqBAEOIP71A8zEIJgwRIACbJyMDJxcIG2EAVYXQLRxgm0Gs7nZGdhwmIfdAC5WBk5WTgYGoEYQALIYfoNZmATcAIuFxv9ffr/NwArULCbLxnD3z3UGLi52hv/ffjKAIoKHk41BvpXvP8gIQU5ZhgtFV8ExghIthgtV/3fHpTE8YbjLcPfTTYafQMUgA2CAA2jguuX3GK5mPITrgzNgitQWSv2fFlfIcOrPMYYP3z7AhBlAnlm5/AbDrYznKHowYuFW/DPGrEX9DGYszgwCQBtBGkH0yg03MTTDTcfG0N0i9f/o/yn/F/xP+K++Wgrsd2zq8Io5nND57w7EeBURkqy5UEmZAYQsAADbOWDTAxBmkQAAAABJRU5ErkJggg=='],
	['pause', 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAB3klEQVQ4jX2Tz0sbURzE3wY8xH+j3i1evBSrUhpRQUwURfxZIirEEiF4k1iqYC/VFjwI4smYlBaClqIHqTFojKmmZq2godgWvejBQgV/RqZvNuERYtYHA8PM7Of0XSH4LFIeKZ/UXEb0rx7IC0XWK5XyC6vm14KWgHZlyG8JSlnlRzm5ls5rswFlBr3bFq7Ez9QW/qR+oCZsAzOqJlwlsz3ZbYMbI7fnAvxiyK33IHm3gV93OxjU3ZCZl6L/LTN2br2X+ZBwZAOepgEv9W7s3YaQTEXh0fvTgIDw0idTm7JbBTcGoCEPwJXoQvx6EbvXXzGQ6FMA+t2bFaNzJV6YA3q/t2H94iNilwvo33EqAH3s8jMiF5/AjSnAGW/G8r8ZhM5n0RdvVwD60LnP6LgxBXRu2TF/No4vfyfh3G5WAHpm82cT4MYU0Bqrhe/Ei8DJCDq+1SsA/YfTUdkNgxtTQFP0OaaO3Jg+9qAlWq0A9MzYcXMfkLkDR6Qcbw87MXHoRGPkmboDembsHJGKPHeQAdStPcHrAztGDxpRv1amAPTM2HGTHyDPs3jpEcb22/Bmvx2Pl4rUKdMzY8fN/VMuMQBWSQ5qAXFF0fMHM81tIud1SL2Tep8RveuBvCD92X9NeXkWOHF72gAAAABJRU5ErkJggg=='],
	['play', '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'],
	['swap', 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAI9SURBVDjLpZNBS9RhEMZ/u60aZAdNSXdLrcxNS82DaRQVRBCUGngwwkOnvkB0yEt0qy/QKSrq5DUSQgLTSi01d80gcrXSTTdTViTU//+ded8ORihFYD4wl+FhYOY3T8A5x2YU3Ij54qOmp833zmX+14CWh431vm9OGs+8W9sPXOm49HsHqxarFhXbZ9W2EQxeECNnxUh0W2Y2kdwIcwtzJCbHY8+uvagBCAG0Vl3G4XDOYZ1jbPbj0ffJ0S6xQrT4AFszsxC1qFPycvJYXl45fOxG7ctXNweOB51zWBzW2V+l7MnbS21JLemFNBmhDIwIxhqMGowKxgjGNxkAISuWB2/uoqIE7Rb255dxMHKInO07CLkMxpMTpOZnmE7NEN4ZQUVITIyPDNyK1wEE1mJsud+QLUavl4cr2o5E64glhumJ9ag629TV1ttRd7VGNWQ/Dd6Ol/6VgguCDTjiYzGWvCWiReX4Pwxe2gPAX/Lx5rx1dAKt7c1OjCBGcOIoyC1kMb1IWTjKvqJSJqbGGR6Nk0gkOBitQMQyNDg0kmj/XA0QMr7hRPkp1ClqBbHKXNY88Q9xineVEC6IUFgQwZ62qFUsFm/Fq9p9Pvx66sl0XdD46y8sKiwuLZL6/o3nvd3Mp+cRJ4gVxCliFRFFjBqAQMOdM06MYHxB/FVEYqRPPG3z0/7qI/kazc/Pp7K6kuSXJEP9b2MznbM1f1D4l4oaI/Uq2qViJ1Ods9ENZ2Hy8dd+NdqtRivXUdhsnH8Cn6RstCM01H4AAAAASUVORK5CYII='],
	['collapse', 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAAOwQAADsEBuJFr7QAAABh0RVh0U29mdHdhcmUAcGFpbnQubmV0IDQuMC41ZYUyZQAAAPNJREFUOE9jcIoq/Y+MGXCACUc6/4MwlIsAyJrwGaA3UeE/CEO5CECMAYEL3f4HHLCG4AWuqGpAmpAxVBgOQM42X6L2v+B1OBiD2H0H27FahAFAmjUnSP1Pv+//P/d5KBin3fP/r94vgREecA6ya/Q7lf+HnrD/n/U4CAWDxKym6mJ3BcwbhZsz/iu0C8ExyBUgjCxWsDEdbgiMgRIOMDZIcfItHzAGscGSuADM+TAMEgNpir/mCca4DMBrKkhTzCU3MCbbBRFnncGYkAvgmkAA2YDQkw5gTJQLoEwUA4KO2oIxUQYgY5AYSBMyBiscJICBAQCpROGZ6kqHfwAAAABJRU5ErkJggg=='],
	['reset', 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAYdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjAuNWWFMmUAAAL8SURBVDhPbZLZTxNRFMbnDzD65BsurC2tSFlENiG4EARBguzIGkBDwKAsIqA+EAIE45JgogaCxrdqgiQmxhAVjWIEpEioChRKUGmZTpeZaSlQ6OedoVYxnOSXe893vnPvzcml/o+V4WGJrbOmgm+tVLJN+UqeYL1Zp+TbLpy1qz7ud9m2D+u9tjq+qYTmLmbZuUvZIOsmNTnCauOvlWuX77dHuux/wzQ6sIvrbOziKrPBlqa64ZsrwF8u26Jxl4pg7WppxuSbHa52iuJry9rZgtOwZCdsUpgKC8nXtRqsDQ2SxgxY8pPddZbU2drSarHZdqsjxXTqqNl8MhYCXEkO1j59AFeeD6fFDMcXFazkQseECmxBuugROZMwtXKrQ0KxRdl95mPRMMdFgi3KxYZuEWtjn2FJT4HTTA4YHwN7rgTr8/PkkHFYUhNFrzkhjryssIgyRkWOmYKDYAoLxUr/MziNRmI6DUFzmkxwjI6Ie0tWJpwMA+5KA0whwaJmSkrqpgwSuZqRyGAMjyY3q2BXPgEjkRNkZAZarL56Le4FbfXlAGw9vTAGKETNKA1QUkxolJX28IEhOAJr4xOwPeiBkAswMSfAhMe6c/vTPtgePgbtLRdzY0o6Tem85WrdHl/opYFYffeevGIc+n1+ELR/ETTHt+/gWjug85SKGq0IU1K/5CFvf+71gwDXcQNO+wrMDVfF/F+4ztvYIPMxZOS6taX45BZKn5Z1d8HLf32BCAv+Clifv8A6TYO9cxd0TiEMBaWwkadvsBzY7l4s+MgheH/Igux0Wk4ixdTXe8wdDBvS7JdCYE4WDH1tA5aHR+AwMHDo9eDJ8HTnqzArVYgeAW1QhJKpur5T/EyWnkfHZ8mwpkhBYNpLhpkDIdAoDovMyIIw5envrs8eIcN90BsuNv+JxZor6dOHorWTPnKnmgxpO776HnBoYuJVS7e7ol1tW2O++JxsNiOvcTIkYlBNbp7w8seEtwzfImKhDjzUr8nMq14srtrtspOgqN9wa0YvcwzUuQAAAABJRU5ErkJggg=='],

	['rectangle-spacer', 'iVBORw0KGgoAAAANSUhEUgAAAAkAAAAECAYAAABcDxXOAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAAOwQAADsEBuJFr7QAAABh0RVh0U29mdHdhcmUAcGFpbnQubmV0IDQuMC41ZYUyZQAAAA1JREFUGFdjGHSAgQEAAJQAAY8LvLEAAAAASUVORK5CYII='],
	['add-column', 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAAOwQAADsEBuJFr7QAAABh0RVh0U29mdHdhcmUAcGFpbnQubmV0IDQuMC41ZYUyZQAAAPVJREFUOE9jUKtncAbi/0RgZwZsACQBUlDwOhwrJtqA3OehyIrBGE0MvwFZj4OwYqjmc9rN7Ft1mtknQ9WLQLUjDEi/749sGxiDxLSb2N6giwMNOwOkIYYAGTjDQLOR5RNME0wMxgcafAxIi+AMA3Q+ugFQ7Iw3DEDiMI3oGMMA9DCA8bFpBmGoOoQBybd8MDBUEYpByGJAjDAg/poniiSIDwzErzA+ugHazWwngDQiEGMuuWHFWk2sH2CaYBiYHs4BadRojDjrjKIITew8UNNO3RbOWUB2LRBjJqTQkw5YMUgOivEn5aCjtlgx0QYQgbEYwMAAAEqqlSGCjw+bAAAAAElFTkSuQmCC'],

	['up-rectangle', 'iVBORw0KGgoAAAANSUhEUgAAAAkAAAAECAYAAABcDxXOAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAAOwgAADsIBFShKgAAAABp0RVh0U29mdHdhcmUAUGFpbnQuTkVUIHYzLjUuMTFH80I3AAAAHklEQVQYV2PAAv5DaZwApACGsQJkBVgVYlMAxQwMABOrD/GvP+EWAAAAAElFTkSuQmCC'],
	['down-rectangle', 'iVBORw0KGgoAAAANSUhEUgAAAAkAAAAECAYAAABcDxXOAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAadEVYdFNvZnR3YXJlAFBhaW50Lk5FVCB2My41LjExR/NCNwAAABpJREFUGFdjgIL/eDAKIKgABggqgAE0BQwMAPTlD/Fpi0JfAAAAAElFTkSuQmCC'],
	['sortable', 'iVBORw0KGgoAAAANSUhEUgAAAA4AAAAKCAYAAACE2W/HAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAYdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjAuNWWFMmUAAAAxSURBVChTY8AD/kNpkgBIEwwTDZA1Ea0ZmyYYHmQAmxNhmCAgSxMMkKUJBvBoYmAAAJCXH+FU1T8+AAAAAElFTkSuQmCC'],
	['empty', 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAYdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjAuNWWFMmUAAAANSURBVBhXY/j//z8DAAj8Av6IXwbgAAAAAElFTkSuQmCC'],
	['up-arrow', 'iVBORw0KGgoAAAANSUhEUgAAAAUAAAAKCAYAAAB8OZQwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAYdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjAuNWWFMmUAAAA9SURBVBhXbYvRCgAgCAOtqP//Y9tElw8NDrcDzd0DBCd7iSL3E0IvGOpf2fKXeZUFKDcYFMwBlDNWS76bXUM5P9In5AzyAAAAAElFTkSuQmCC'],
	['down-arrow', 'iVBORw0KGgoAAAANSUhEUgAAAAUAAAAKCAYAAAB8OZQwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAYdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjAuNWWFMmUAAAA+SURBVBhXhYvRCgAgCAOtqP//4+WWhtBDB1duqBUQ/2W5LLtSMFyW020skuecwOGj6QzfkuExt1LlcqICgG3S7z/SL/jVpgAAAABJRU5ErkJggg==']
];


(function() {
	var each, img;
	for (var i = 0; i < imgData.length; i++) {
		each = imgData[i];
		img = new Image();
		img.src = 'data:image/png;base64,' + each[1];
		imageCache[each[0]] = img;
	}
})();

export default class ModelBase {

	getDataModel() {
		if (this.dataModel === null) {
			this.setDataModel(this.getDefaultDataModel());
		}
		return this.dataModel;
	}

	getDefaultDataModel() {
		// var model = document.createElement('fin-hypergrid-data-model-base');
		return model;
	}

	setDataModel(newDataModel) {
		this.dataModel = newDataModel;
	}

	clearObjectProperties(obj) {
		for (var prop in obj) {
			if (obj.hasOwnProperty(prop)) {
				delete obj[prop];
			}
		}
	}

	constructor() {
		this.tableState = null;
		this.grid = null;
		this.editorTypes = ['choice', 'textfield', 'color', 'slider', 'spinner', 'date'];
		this.featureChain = null;
		this.dataModel = null;
		this.cellProvider = this.createCellProvider();
		this.renderedColumnCount = 30;
		this.renderedRowCount = 60;
		this.dataUpdates = {};
		this.scrollPositionX = 0;
		this.scrollPositionY = 0;
	}

	getState() {
		if (!this.tableState) {
			this.tableState = this.getDefaultState();
			this.initColumnIndexes(this.tableState);
		}
		return this.tableState;
	}

	clearState() {
		this.tableState = null;
	}

	getDefaultState() {
		return {
			columnIndexes: [],
			fixedColumnIndexes: [],
			hiddenColumns: [],

			columnWidths: [],
			fixedColumnWidths: [],
			fixedColumnAutosized: [],

			rowHeights: {},
			fixedRowHeights: {},
			columnProperties: [],
			columnAutosized: [],

			fixedColumnCount: 0,
			fixedRowCount: 1,
		};
	}

	setState(state) {
		var tableState = this.getState();
		for (var key in state) {
			if (state.hasOwnProperty(key)) {
				tableState[key] = state[key];
			}
		}
	}

	resolveProperty(key) {
		return this.grid.resolveProperty(key);
	}

	cellClicked( /* cell, event */ ) {

	}

	cellDoubleClicked( /* cell, event */ ) {

	}

	initColumnIndexes(tableState) {
		var columnCount = this.getColumnCount();
		var fixedColumnCount = tableState.fixedColumnCount;
		var i;
		for (i = 0; i < columnCount; i++) {
			tableState.columnIndexes[i] = i;
		}
		for (i = 0; i < fixedColumnCount; i++) {
			tableState.fixedColumnIndexes[i] = i;
		}
	}

	insureColumnIndexesAreInitialized() {
		this.swapColumns(0, 0);
	}

	swapColumns(src, tar) {
		var tableState = this.getState();
		var fixedColumnCount = this.getState().fixedColumnCount;
		var indexes = tableState.columnIndexes;
		if (indexes.length === 0) {
			this.initColumnIndexes(tableState);
			indexes = tableState.columnIndexes;
		}
		var tmp = indexes[src + fixedColumnCount];
		indexes[src + fixedColumnCount] = indexes[tar + fixedColumnCount];
		indexes[tar + fixedColumnCount] = tmp;
	}

	translateColumnIndex(x) {
		var tableState = this.getState();
		var fixedColumnCount = tableState.fixedColumnCount;
		var indexes = tableState.columnIndexes;
		if (indexes.length === 0) {
			return x;
		}
		return indexes[x + fixedColumnCount];
	}

	unTranslateColumnIndex(x) {
		var tableState = this.getState();
		return tableState.columnIndexes.indexOf(x);
	}

	setNextFeature(nextFeature) {
		if (this.featureChain) {
			this.featureChain.setNext(nextFeature);
		} else {
			this.featureChain = nextFeature;
		}
	}

	installOn(grid) {
		grid.setBehavior(this);
		this.initializeFeatureChain(grid);
	}

	initializeFeatureChain(grid) {
		this.setNextFeature(new KeyPaging());
		this.setNextFeature(new CellClick());
		// this.setNextFeature(document.createElement('fin-hypergrid-feature-overlay'));
		// this.setNextFeature(document.createElement('fin-hypergrid-feature-column-resizing'));
		// this.setNextFeature(document.createElement('fin-hypergrid-feature-row-resizing'));
		this.setNextFeature(new CellSelection());
		// this.setNextFeature(document.createElement('fin-hypergrid-feature-column-moving'));
		this.setNextFeature(new ThumbwheelScrolling());
		// this.setNextFeature(document.createElement('fin-hypergrid-feature-cell-editing'));
		this.setNextFeature(new ColumnSorting());
		this.setNextFeature(new OnHover());
		this.setNextFeature(new ColumnAutosizing());

		this.featureChain.initializeOn(grid);
	}

	getCellProvider() {
		return this.cellProvider;
	}

	setGrid(finGrid) {
		this.grid = finGrid;
	}

	getGrid() {
		return this.grid;
	}

	createCellProvider() {
		var provider = new CellProvider();
		return provider;
	}

	getTopLeftValue( /* x, y */ ) {
		return '';
	}

	_getValue(x, y) {
		x = this.translateColumnIndex(x);
		var override = this.dataUpdates['p_' + x + '_' + y];
		if (override) {
			return override;
		}
		return this.getValue(x, y);
	}

	_setValue(x, y, value) {
		x = this.translateColumnIndex(x);
		this.setValue(x, y, value);
	}

	_getFixedRowValue(x, y) {
		x = this.translateColumnIndex(x);
		return this.getFixedRowValue(x, y);
	}

	getFixedColumnValue(x, y) {
		//x = this.fixedtranslateColumnIndex(x);
		return y + 1;
	}

	getRowCount() {
		//jeepers batman a quadrillion rows!
		return 1000000000000000;
	}

	_getColumnCount() {
		var tableState = this.getState();
		var fixedColumnCount = this.getState().fixedColumnCount;
		return this.getColumnCount() - tableState.hiddenColumns.length - fixedColumnCount;
	}

	getFixedRowsHeight() {
		var count = this.getFixedRowCount();
		var total = 0;
		for (var i = 0; i < count; i++) {
			total = total + this.getFixedRowHeight(i);
		}
		return total;
	}

	getFixedRowHeight(rowNum) {
		var tableState = this.getState();
		if (tableState.fixedRowHeights) {
			var override = tableState.fixedRowHeights[rowNum];
			if (override) {
				return override;
			}
		}
		return this.resolveProperty('defaultFixedRowHeight');
	}

	setFixedRowHeight(rowNum, height) {
		//console.log(rowNum + ' ' + height);
		var tableState = this.getState();
		tableState.fixedRowHeights[rowNum] = Math.max(5, height);
		this.changed();
	}

	getRowHeight(rowNum) {
		var tableState = this.getState();
		if (tableState.rowHeights) {
			var override = tableState.rowHeights[rowNum];
			if (override) {
				return override;
			}
		}
		return this.getDefaultRowHeight();
	}

	getDefaultRowHeight() {
		if (!this.defaultRowHeight) {
			this.defaultRowHeight = this.resolveProperty('defaultRowHeight');
		}
		return this.defaultRowHeight;
	}

	setRowHeight(rowNum, height) {
		var tableState = this.getState();
		tableState.rowHeights[rowNum] = Math.max(5, height);
		this.changed();
	}

	getFixedRowsMaxHeight() {
		var height = this.getFixedRowsHeight();
		return height;
	}

	getFixedColumnsWidth() {
		var count = this.getFixedColumnCount();
		var total = 0;
		for (var i = 0; i < count; i++) {
			total = total + this.getFixedColumnWidth(i);
		}
		return total;
	}

	setFixedColumnWidth(colNumber, width) {
		var tableState = this.getState();
		tableState.fixedColumnWidths[colNumber] = Math.max(5, width);
		this.changed();
	}

	getFixedColumnsMaxWidth() {
		var width = this.getFixedColumnsWidth();
		return width;
	}

	getFixedColumnWidth(colNumber) {
		var tableState = this.getState();
		var override = tableState.fixedColumnWidths[colNumber];
		if (override) {
			return override;
		}
		return this.resolveProperty('defaultFixedColumnWidth');
	}

	_getColumnWidth(x) {
		x = this.translateColumnIndex(x);
		return this.getColumnWidth(x);
	}

	_setColumnWidth(x, width) {
		x = this.translateColumnIndex(x);
		this.setColumnWidth(x, width);
		this.changed();
	}

	_setScrollPositionY(y) {
		this.setScrollPositionY(y);
		this.changed();
	}

	_setScrollPositionX(x) {
		this.setScrollPositionX(x);
		this.changed();
	}

	setRenderedColumnCount(count) {
		this.renderedColumnCount = count;
	}

	setRenderedRowCount(count) {
		this.renderedRowCount = count;
	}

	_getColumnAlignment(x) {
		x = this.translateColumnIndex(x);
		return this.getColumnAlignment(x);
	}

	getTopLeftAlignment( /* x, y */ ) {
		return 'center';
	}

	getFixedColumnAlignment( /* x */ ) {
		return this.resolveProperty('fixedColumnAlign');
	}

	_getFixedRowAlignment(x, y) {
		x = this.translateColumnIndex(x);
		return this.getFixedRowAlignment(x, y);
	}

	topLeftClicked(grid, mouse) {
		if (mouse.gridCell.x < this.getState().fixedColumnCount) {
			this.fixedRowClicked(grid, mouse);
		} else {
			console.log('top Left clicked: ' + mouse.gridCell.x, mouse);
		}
	}

	_fixedRowClicked(grid, mouse) {
		var x = this.translateColumnIndex(this.getScrollPositionX() + mouse.gridCell.x - this.getFixedColumnCount());
		var translatedPoint = Rectangles.point.create(x, mouse.gridCell.y);
		mouse.gridCell = translatedPoint;
		this.fixedRowClicked(grid, mouse);
	}

	_fixedColumnClicked(grid, mouse) {
		var translatedPoint = Rectangles.point.create(mouse.gridCell.x, this.getScrollPositionY() + mouse.gridCell.y - this.getFixedRowCount());
		mouse.gridCell = translatedPoint;
		this.fixedColumnClicked(grid, mouse);
	}

	setCursor(grid) {
		grid.updateCursor();
		this.featureChain.setCursor(grid);
	}

	onMouseMove(grid, event) {
		if (this.featureChain) {
			this.featureChain.handleMouseMove(grid, event);
			this.setCursor(grid);
		}
	}

	onTap(grid, event) {
		if (this.featureChain) {
			this.featureChain.handleTap(grid, event);
			this.setCursor(grid);
		}
	}

	onWheelMoved(grid, event) {
		if (this.featureChain) {
			this.featureChain.handleWheelMoved(grid, event);
			this.setCursor(grid);
		}
	}

	onMouseUp(grid, event) {
		if (this.featureChain) {
			this.featureChain.handleMouseUp(grid, event);
			this.setCursor(grid);
		}
	}

	onMouseDrag(grid, event) {
		if (this.featureChain) {
			this.featureChain.handleMouseDrag(grid, event);
			this.setCursor(grid);
		}
	}

	onKeyDown(grid, event) {
		if (this.featureChain) {
			this.featureChain.handleKeyDown(grid, event);
			this.setCursor(grid);
		}
	}

	onKeyUp(grid, event) {
		if (this.featureChain) {
			this.featureChain.handleKeyUp(grid, event);
			this.setCursor(grid);
		}
	}

	onDoubleClick(grid, event) {
		if (this.featureChain) {
			this.featureChain.handleDoubleClick(grid, event);
			this.setCursor(grid);
		}
	}

	onHoldPulse(grid, event) {
		if (this.featureChain) {
			this.featureChain.handleHoldPulse(grid, event);
			this.setCursor(grid);
		}
	}

	toggleColumnPicker() {
		if (this.featureChain) {
			this.featureChain.toggleColumnPicker(this.getGrid());
		}
	}

	handleMouseDown(grid, event) {
		if (this.featureChain) {
			this.featureChain.handleMouseDown(grid, event);
			this.setCursor(grid);
		}
	}

	handleMouseExit(grid, event) {
		if (this.featureChain) {
			this.featureChain.handleMouseExit(grid, event);
			this.setCursor(grid);
		}
	}

	_getCellEditorAt(x, y) {
		noop(y);
		x = this.translateColumnIndex(x);
		return this.getCellEditorAt(x);
	}

	changed() {}

	shapeChanged() {}

	isColumnReorderable() {
		return true;
	}

	getColumnProperties(columnIndex) {
		//if no cell properties are supplied these properties are used
		//this probably should be moved into it's own object
		// this.clearObjectProperties(this.columnProperties);
		// if (columnIndex === 4) {
		//     this.columnProperties.bgColor = 'maroon';
		//     this.columnProperties.fgColor = 'white';
		// }
		var tableState = this.getState();
		var properties = tableState.columnProperties[columnIndex];
		if (!properties) {
			properties = {};
			tableState.columnProperties[columnIndex] = properties;
		}
		return properties;
	}

	setColumnProperty(columnIndex, key, value) {
		var properties = this.getColumnProperties(columnIndex);
		properties[key] = value;
		this.changed();
	}

	getColumnDescriptors() {
		//assumes there is one row....
		this.insureColumnIndexesAreInitialized();
		var tableState = this.getState();
		var columnCount = tableState.columnIndexes.length;
		var fixedColumnCount = this.getState().fixedColumnCount;
		var labels = [];
		for (var i = 0; i < columnCount; i++) {
			var id = tableState.columnIndexes[i];
			if (id >= fixedColumnCount) {
				labels.push({
					id: id,
					label: this.getHeader(id),
					field: this.getField(id)
				});
			}
		}
		return labels;
	}

	getField(colIndex) {
		return colIndex;
	}

	getHeader(colIndex) {
		return this.getFixedRowValue(colIndex, 0);
	}

	setColumnDescriptors(list) {
		//assumes there is one row....
		var tableState = this.getState();
		var fixedColumnCount = this.getState().fixedColumnCount;

		var columnCount = list.length;
		var indexes = [];
		var i;
		for (i = 0; i < fixedColumnCount; i++) {
			indexes.push(i);
		}
		for (i = 0; i < columnCount; i++) {
			indexes.push(list[i].id);
		}
		tableState.columnIndexes = indexes;
		this.changed();
	}

	getHiddenColumnDescriptors() {
		var tableState = this.getState();
		var indexes = tableState.hiddenColumns;
		var labels = new Array(indexes.length);
		for (var i = 0; i < labels.length; i++) {
			var id = indexes[i];
			labels[i] = {
				id: id,
				label: this.getHeader(id),
				field: this.getField(id)
			};
		}
		return labels;
	}

	setHiddenColumnDescriptors(list) {
		//assumes there is one row....
		var columnCount = list.length;
		var indexes = new Array(columnCount);
		for (var i = 0; i < columnCount; i++) {
			indexes[i] = list[i].id;
		}
		var tableState = this.getState();
		tableState.hiddenColumns = indexes;
		this.changed();
	}

	hideColumns(arrayOfIndexes) {
		var tableState = this.getState();
		var indexes = tableState.hiddenColumns;
		var order = tableState.columnIndexes;
		for (var i = 0; i < arrayOfIndexes.length; i++) {
			var each = arrayOfIndexes[i];
			if (indexes.indexOf(each) === -1) {
				indexes.push(each);
				order.splice(order.indexOf(each), 1);
			}
		}
	}

	getFixedColumnCount() {
		var tableState = this.getState();
		return tableState.fixedColumnCount || 0;
	}

	setFixedColumnCount(numberOfFixedColumns) {
		var tableState = this.getState();
		tableState.fixedColumnCount = numberOfFixedColumns;
	}

	getFixedRowCount() {
		return this.tableState.fixedRowCount || 0;
	}

	setFixedRowCount(numberOfFixedRows) {
		this.tableState.fixedRowCount = numberOfFixedRows;
	}

	openEditor(div) {
		var container = document.createElement('div');

		var hidden = document.createElement('fin-hypergrid-dnd-list');
		var visible = document.createElement('fin-hypergrid-dnd-list');

		container.appendChild(hidden);
		container.appendChild(visible);

		this.beColumnStyle(hidden.style);
		hidden.title = 'hidden columns';
		hidden.list = this.getHiddenColumnDescriptors();

		this.beColumnStyle(visible.style);
		visible.style.left = '50%';
		visible.title = 'visible columns';
		visible.list = this.getColumnDescriptors();

		div.lists = {
			hidden: hidden.list,
			visible: visible.list
		};
		div.appendChild(container);
		return true;
	}

	closeEditor(div) {
		noop(div);
		var lists = div.lists;
		this.setColumnDescriptors(lists.visible);
		this.setHiddenColumnDescriptors(lists.hidden);
		return true;
	}

	endDragColumnNotification() {}

	beColumnStyle(style) {
		style.top = '5%';
		style.position = 'absolute';
		style.width = '50%';
		style.height = '99%';
		style.whiteSpace = 'nowrap';
	}

	getCursorAt( /* x, y */ ) {
		return null;
	}

	getValue(x, y) {
		return x + ', ' + y;
	}

	setValue(x, y, value) {
		this.dataUpdates['p_' + x + '_' + y] = value;
	}

	getColumnCount() {
		return 300;
	}

	getColumnWidth(x) {
		var tableState = this.getState();
		var override = tableState.columnWidths[x];
		if (override) {
			return override;
		}
		return this.resolveProperty('defaultColumnWidth');
	}

	setColumnWidth(x, width) {
		var tableState = this.getState();
		tableState.columnWidths[x] = Math.max(5, width);
	}

	getColumnAlignment( /* x */ ) {
		return 'center';
	}

	setScrollPositionX(x) {
	  this.scrollPositionX = x;
	}

	getScrollPositionX() {
		return this.scrollPositionX;
	}

	setScrollPositionY(y) {
	  this.scrollPositionY = y;
	}

	getScrollPositionY() {
		return this.scrollPositionY;
	}

	getFixedRowAlignment(x, y) {
		noop(x, y);
		return this.resolveProperty('fixedRowAlign');
	}

	getFixedRowValue(x /*, y*/ ) {
		return x;
	}

	getCellEditorAt(x, y) {
		noop(x, y);
		var cellEditor = this.grid.resolveCellEditor('textfield');
		return cellEditor;
	}

	fixedRowClicked(grid, mouse) {
		this.toggleSort(mouse.gridCell.x);
	}

	toggleSort(colIndex) {
		console.log('toggleSort(' + colIndex + ')');
	}

	fixedColumnClicked(grid, mouse) {
		console.log('fixedColumnClicked(' + mouse.gridCell.x + ', ' + mouse.gridCell.y + ')');
	}

	highlightCellOnHover(isColumnHovered, isRowHovered) {
		return isColumnHovered && isRowHovered;
	}

	getColumnId(x) {
		x = this.translateColumnIndex(x);
		var col = this.getFixedRowValue(x, 0);
		return col;
	}

	getImage(key) {
		var image = imageCache[key];
		return image;
	}

	setImage(key, image) {
		imageCache[key] = image;
	}

	checkColumnAutosizing(fixedMinWidths, minWidths) {
		var self = this;
		var tableState = this.getState();
		var myFixed = tableState.fixedColumnWidths;
		var myWidths = tableState.columnWidths;
		var repaint = false;
		var a, b, c, d = 0;
		var newVal;
		for (c = 0; c < fixedMinWidths.length; c++) {
			a = myFixed[c];
			b = fixedMinWidths[c];
			d = tableState.fixedColumnAutosized[c];
			if (a !== b || !d) {
				newVal = !d ? b : Math.max(a, b);
				if (myFixed[c] !== newVal) {
					myFixed[c] = newVal;
					tableState.fixedColumnAutosized[c] = true;
					repaint = true;
				}
			}
		}
		for (c = 0; c < minWidths.length; c++) {
			var ti = this.translateColumnIndex(c);
			a = myWidths[ti];
			b = minWidths[c];
			d = tableState.columnAutosized[c];
			if (a !== b || !d) {
				newVal = !d ? b : Math.max(a, b);
				if (myWidths[ti] !== newVal) {
					myWidths[ti] = newVal;
					tableState.columnAutosized[c] = true;
					repaint = true;
				}
			}
		}
		if (repaint) {
			setTimeout(function() {
				self.shapeChanged();
			});
		}
	}

	cellPrePaintNotification( /* cell */ ) {

	}

	cellFixedRowPrePaintNotification( /* cell */ ) {

	}

	cellFixedColumnPrePaintNotification( /* cell */ ) {

	}

	cellTopLeftPrePaintNotification( /* cell */ ) {

	}

	enhanceDoubleClickEvent( /* event */ ) {}

	autosizeColumns() {
		var self = this;
		setTimeout(function() {
			var tableState = self.getState();
			tableState.fixedColumnAutosized = [];
			tableState.columnAutosized = [];
		}, 40);
	}

	getFieldName(index) {
		return this.getFields()[index];
	}

	getColumnIndex(fieldName) {
		return this.getFields().indexOf(fieldName);
	}
}