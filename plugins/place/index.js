class Place extends doczilla.Plugin {

  constructor(options, doczilla) {
    super(options, doczilla);
    doczilla.on('beforeParse', this.handle.bind(this, 'beforeParse'));
    doczilla.on('afterParse', this.handle.bind(this, 'afterParse'));
  }

  async handle(mode, doc) {
    const event = { places: [] };
    await doczilla.emitAsync('place', event);
    const places = event.places.filter(item => {
      item.mode = item.mode || 'beforeParse'
      return item.mode === mode;
    });
    const field = mode === 'beforeParse' ? 'source' : 'result';
    for (let place of places) {
      const { name, render, marker = '::' } = place;
      if (!render) return;
      const regexp = new RegExp(`${marker}\\s*${name}\\s+(.*)`, 'ig');
      let info;
      while (info = regexp.exec(doc[field])) {
        if (!info || info.length < 2) return;
        const match = info[0], param = info[1].trim().replace(/<.+?>/g, '');
        const result = await render({ match, param, doc });
        doc[field] = doc[field].replace(match, result);
      }
    }
  }

}

module.exports = Place;