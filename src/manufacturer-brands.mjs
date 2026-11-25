// Neutral identifiers, not manufacturer logos. Set logo to an approved local asset.
export const manufacturerBrands=Object.freeze({
 elmos:{short:'E',logo:null,source:'https://www.elmos.com/english/about-elmos/newsroom/media-database.html'},
 renesas:{short:'R',logo:null,source:'https://www.renesas.com/en/legal-notices'},
 novosense:{short:'N',logo:null,source:'https://www.novosns.com/en'},
 ti:{short:'TI',logo:null,source:'https://www.ti.com/en-us/legal/terms-conditions/trademarks/signature-and-logo'},
 melexis:{short:'M',logo:null,source:'https://www.melexis.com/en/legal/terms-of-use'},
 adi:{short:'ADI',logo:null,source:'https://www.analog.com/en/newsroom.html'},
 jhm:{short:'JHM',logo:null,source:'https://www.jiuhaomicro.com/'}
});
export function brandMark(id){
 const brand=manufacturerBrands[id];
 if(!brand)throw Error('Missing manufacturer identity '+id);
 if(brand.logo&&/^assets\/manufacturers\/[a-zA-Z0-9._-]+\.(svg|png|webp)$/.test(brand.logo))return '<span class="maker-icon has-logo" aria-hidden="true"><img src="./'+brand.logo+'" alt="" width="96" height="32"></span>';
 return '<span class="maker-icon maker-monogram" aria-hidden="true">'+brand.short+'</span>';
}
